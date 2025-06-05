export type Official = {
  id: string;
  full_name: string;
  age: number;
  document_id: string;
  position: string;
  profession: string;
  procedure: string;
  status: EmploymentStatus;
  entry_date: string;
  created_at: string;
};

export type OfficialRole = {
  id: string;
  official_id: string;
  system_id: string;
  system: SystemInfo;
  granted_at: string;
};

export type SystemInfo = {
  id: string;
  name: string;
  description: string;
};

export type InventoryItem = {
  id: string;
  official_id: string;
  description: string;
  code: string;
  value: number;
  assigned_at: string;
};

export type EventType = 'FOLLOW_UP' | 'TRIAL_PERIOD_EVALUATION' | 'ANNUAL_EVALUATION';

export type OfficialEvent = {
  id: string;
  official_id: string;
  event_type: EventType;
  scheduled_date: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
};

export type EmploymentStatus = 'PROVISIONAL' | 'POSITIONED' | 'INACTIVE' | 'FOLLOW_UP';

export type User = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERUSER';
  created_at: string;
};

export type DashboardMetrics = {
  officialsCount: number;
  activeRolesCount: number;
  totalInventoryValue: number;
  statusCounts: {
    [key in EmploymentStatus]: number;
  };
  upcomingEvents: number;
};