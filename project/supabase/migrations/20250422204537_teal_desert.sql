/*
  # Automatic event creation triggers

  1. Purpose
    - Automatically create events for officials based on their status and entry date
    - Handle status changes from PROVISIONAL to POSITIONED

  2. Functionality
    - Create events for new officials based on their status
    - Create additional events when official status changes from PROVISIONAL to POSITIONED
*/

-- Function to create automatic events for officials
CREATE OR REPLACE FUNCTION create_automatic_events()
RETURNS TRIGGER AS $$
DECLARE
  entry_date DATE;
BEGIN
  entry_date := NEW.entry_date::DATE;
  
  -- Create events based on status
  IF NEW.status = 'POSITIONED' THEN
    -- Follow-up at 3 months
    INSERT INTO official_events (
      official_id,
      event_type,
      scheduled_date
    ) VALUES (
      NEW.id,
      'FOLLOW_UP',
      entry_date + INTERVAL '3 months'
    );
    
    -- Trial period evaluation at 6 months
    INSERT INTO official_events (
      official_id,
      event_type,
      scheduled_date
    ) VALUES (
      NEW.id,
      'TRIAL_PERIOD_EVALUATION',
      entry_date + INTERVAL '6 months'
    );
  END IF;
  
  -- Both POSITIONED and PROVISIONAL have annual evaluations
  IF NEW.status IN ('POSITIONED', 'PROVISIONAL') THEN
    -- Annual evaluation at 12 months
    INSERT INTO official_events (
      official_id,
      event_type,
      scheduled_date
    ) VALUES (
      NEW.id,
      'ANNUAL_EVALUATION',
      entry_date + INTERVAL '1 year'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new officials
CREATE TRIGGER trigger_create_events_for_new_officials
AFTER INSERT ON officials
FOR EACH ROW
EXECUTE FUNCTION create_automatic_events();

-- Function to handle status changes
CREATE OR REPLACE FUNCTION handle_official_status_change()
RETURNS TRIGGER AS $$
DECLARE
  entry_date DATE;
BEGIN
  -- If status changed from PROVISIONAL to POSITIONED
  IF OLD.status = 'PROVISIONAL' AND NEW.status = 'POSITIONED' THEN
    entry_date := NEW.entry_date::DATE;
    
    -- Follow-up at 3 months from original entry date
    INSERT INTO official_events (
      official_id,
      event_type,
      scheduled_date
    ) VALUES (
      NEW.id,
      'FOLLOW_UP',
      entry_date + INTERVAL '3 months'
    )
    ON CONFLICT DO NOTHING;
    
    -- Trial period evaluation at 6 months from original entry date
    INSERT INTO official_events (
      official_id,
      event_type,
      scheduled_date
    ) VALUES (
      NEW.id,
      'TRIAL_PERIOD_EVALUATION',
      entry_date + INTERVAL '6 months'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for status changes
CREATE TRIGGER trigger_handle_official_status_change
AFTER UPDATE OF status ON officials
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION handle_official_status_change();