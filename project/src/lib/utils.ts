import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, addMonths, addYears } from 'date-fns';
import { EventType, EmploymentStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'dd MMM yyyy');
}

export function getStatusColor(status: EmploymentStatus): string {
  switch (status) {
    case 'PROVISIONAL':
      return 'bg-amber-500';
    case 'POSITIONED':
      return 'bg-green-500';
    case 'INACTIVE':
      return 'bg-gray-500';
    case 'FOLLOW_UP':
      return 'bg-blue-500';
    default:
      return 'bg-gray-300';
  }
}

export function getEventTypeLabel(eventType: EventType): string {
  switch (eventType) {
    case 'FOLLOW_UP':
      return 'Seguimiento';
    case 'TRIAL_PERIOD_EVALUATION':
      return 'Evaluación de Período de Prueba';
    case 'ANNUAL_EVALUATION':
      return 'Evaluación Anual';
    default:
      return 'Evento';
  }
}

export function calculateAutoEvents(entryDate: Date, status: EmploymentStatus) {
  const events = [];
  
  if (status === 'POSITIONED') {
    // At 3 months -> follow-up event
    events.push({
      event_type: 'FOLLOW_UP' as EventType,
      scheduled_date: addMonths(entryDate, 3),
    });
    
    // At 6 months -> trial period evaluation
    events.push({
      event_type: 'TRIAL_PERIOD_EVALUATION' as EventType,
      scheduled_date: addMonths(entryDate, 6),
    });
  }
  
  // Both POSITIONED and PROVISIONAL have annual evaluations
  if (status === 'POSITIONED' || status === 'PROVISIONAL') {
    // At 12 months -> annual evaluation
    events.push({
      event_type: 'ANNUAL_EVALUATION' as EventType,
      scheduled_date: addYears(entryDate, 1),
    });
  }
  
  return events;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}