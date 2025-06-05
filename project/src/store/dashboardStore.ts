import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DashboardMetrics } from '../types';
import toast from 'react-hot-toast';

interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

const initialMetrics: DashboardMetrics = {
  officialsCount: 0,
  activeRolesCount: 0,
  totalInventoryValue: 0,
  statusCounts: {
    PROVISIONAL: 0,
    POSITIONED: 0,
    INACTIVE: 0,
    FOLLOW_UP: 0
  },
  upcomingEvents: 0
};

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  isLoading: false,
  error: null,
  
  fetchMetrics: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get officials count
      const { count: officialsCount, error: officialsError } = await supabase
        .from('officials')
        .select('*', { count: 'exact', head: true });
      
      if (officialsError) throw officialsError;
      
      // Get active roles count
      const { count: activeRolesCount, error: rolesError } = await supabase
        .from('official_roles')
        .select('*', { count: 'exact', head: true });
      
      if (rolesError) throw rolesError;
      
      // Get total inventory value
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('value');
      
      if (inventoryError) throw inventoryError;
      
      const totalInventoryValue = inventoryData.reduce((sum, item) => sum + (item.value || 0), 0);
      
      // Get counts by status
      const { data: statusData, error: statusError } = await supabase
        .from('officials')
        .select('status');
      
      if (statusError) throw statusError;
      
      const statusCounts = {
        PROVISIONAL: 0,
        POSITIONED: 0,
        INACTIVE: 0,
        FOLLOW_UP: 0
      };
      
      statusData.forEach(item => {
        if (item.status in statusCounts) {
          statusCounts[item.status as keyof typeof statusCounts]++;
        }
      });
      
      // Get upcoming events (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { count: upcomingEvents, error: eventsError } = await supabase
        .from('official_events')
        .select('*', { count: 'exact', head: true })
        .eq('completed', false)
        .lt('scheduled_date', thirtyDaysFromNow.toISOString())
        .gt('scheduled_date', new Date().toISOString());
      
      if (eventsError) throw eventsError;
      
      set({
        metrics: {
          officialsCount: officialsCount || 0,
          activeRolesCount: activeRolesCount || 0,
          totalInventoryValue,
          statusCounts,
          upcomingEvents: upcomingEvents || 0
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      set({
        metrics: initialMetrics,
        error: error instanceof Error ? error.message : 'Error al obtener métricas del dashboard',
        isLoading: false
      });
      toast.error('Error al cargar métricas');
    }
  }
}));