import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Official, OfficialRole, InventoryItem, OfficialEvent } from '../types';
import { calculateAutoEvents } from '../lib/utils';
import toast from 'react-hot-toast';

interface OfficialsState {
  officials: Official[];
  roles: OfficialRole[];
  inventory: InventoryItem[];
  events: OfficialEvent[];
  isLoading: boolean;
  error: string | null;
  
  fetchOfficials: () => Promise<void>;
  fetchRoles: (officialId?: string) => Promise<void>;
  fetchInventory: (officialId?: string) => Promise<void>;
  fetchEvents: (officialId?: string) => Promise<void>;
  
  addOfficial: (official: Omit<Official, 'id' | 'created_at'>) => Promise<string | null>;
  updateOfficial: (id: string, updates: Partial<Omit<Official, 'id' | 'created_at'>>) => Promise<void>;
  deleteOfficial: (id: string) => Promise<void>;
  
  addRole: (role: Omit<OfficialRole, 'id' | 'system' | 'granted_at'>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'assigned_at'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'official_id' | 'assigned_at'>>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  
  changeOfficialStatus: (officialId: string, newStatus: Official['status']) => Promise<void>;
}

export const useOfficialsStore = create<OfficialsState>((set, get) => ({
  officials: [],
  roles: [],
  inventory: [],
  events: [],
  isLoading: false,
  error: null,
  
  fetchOfficials: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('officials')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      
      set({ officials: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching officials:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al obtener funcionarios', 
        isLoading: false 
      });
    }
  },
  
  fetchRoles: async (officialId) => {
    try {
      set({ isLoading: true, error: null });
      
      let query = supabase
        .from('official_roles')
        .select(`
          id,
          official_id,
          system_id,
          granted_at,
          system:systems (id, name, description)
        `);
      
      if (officialId) {
        query = query.eq('official_id', officialId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process the data to match our type
      const processedRoles = data.map(role => ({
        ...role,
        system: role.system as unknown as { id: string; name: string; description: string }
      })) as OfficialRole[];
      
      set({ roles: processedRoles, isLoading: false });
    } catch (error) {
      console.error('Error fetching roles:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al obtener roles', 
        isLoading: false 
      });
    }
  },
  
  fetchInventory: async (officialId) => {
    try {
      set({ isLoading: true, error: null });
      
      let query = supabase
        .from('inventory')
        .select('*');
      
      if (officialId) {
        query = query.eq('official_id', officialId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ inventory: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al obtener inventario', 
        isLoading: false 
      });
    }
  },
  
  fetchEvents: async (officialId) => {
    try {
      set({ isLoading: true, error: null });
      
      let query = supabase
        .from('official_events')
        .select('*')
        .order('scheduled_date');
      
      if (officialId) {
        query = query.eq('official_id', officialId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ events: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al obtener eventos', 
        isLoading: false 
      });
    }
  },
  
  addOfficial: async (official) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('officials')
        .insert([official])
        .select()
        .single();
      
      if (error) throw error;
      
      // Generate automatic events based on status and entry date
      if (data) {
        const entryDate = new Date(data.entry_date);
        const autoEvents = calculateAutoEvents(entryDate, data.status);
        
        if (autoEvents.length > 0) {
          const eventsToInsert = autoEvents.map(event => ({
            official_id: data.id,
            event_type: event.event_type,
            scheduled_date: event.scheduled_date.toISOString(),
            completed: false,
            notes: null
          }));
          
          const { error: eventsError } = await supabase
            .from('official_events')
            .insert(eventsToInsert);
          
          if (eventsError) throw eventsError;
        }
      }
      
      // Refresh the officials list
      await get().fetchOfficials();
      
      set({ isLoading: false });
      toast.success('Funcionario agregado con éxito');
      
      return data?.id || null;
    } catch (error) {
      console.error('Error adding official:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al agregar funcionario', 
        isLoading: false 
      });
      toast.error('Error al agregar funcionario');
      return null;
    }
  },
  
  updateOfficial: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('officials')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the officials list
      await get().fetchOfficials();
      
      set({ isLoading: false });
      toast.success('Funcionario actualizado con éxito');
    } catch (error) {
      console.error('Error updating official:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar funcionario', 
        isLoading: false 
      });
      toast.error('Error al actualizar funcionario');
    }
  },
  
  deleteOfficial: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // First delete related records from other tables (cascade would be better in DB)
      await supabase.from('official_roles').delete().eq('official_id', id);
      await supabase.from('inventory').delete().eq('official_id', id);
      await supabase.from('official_events').delete().eq('official_id', id);
      
      // Then delete the official
      const { error } = await supabase
        .from('officials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state by filtering out the deleted official
      set(state => ({
        officials: state.officials.filter(o => o.id !== id),
        isLoading: false
      }));
      
      toast.success('Funcionario eliminado con éxito');
    } catch (error) {
      console.error('Error deleting official:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar funcionario', 
        isLoading: false 
      });
      toast.error('Error al eliminar funcionario');
    }
  },
  
  addRole: async (role) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('official_roles')
        .insert([{
          ...role,
          granted_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      // Refresh the roles list
      await get().fetchRoles(role.official_id);
      
      set({ isLoading: false });
      toast.success('Rol agregado con éxito');
    } catch (error) {
      console.error('Error adding role:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al agregar rol', 
        isLoading: false 
      });
      toast.error('Error al agregar rol');
    }
  },
  
  deleteRole: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('official_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state by filtering out the deleted role
      set(state => ({
        roles: state.roles.filter(r => r.id !== id),
        isLoading: false
      }));
      
      toast.success('Rol eliminado con éxito');
    } catch (error) {
      console.error('Error deleting role:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar rol', 
        isLoading: false 
      });
      toast.error('Error al eliminar rol');
    }
  },
  
  addInventoryItem: async (item) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('inventory')
        .insert([{
          ...item,
          assigned_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      // Refresh the inventory list
      await get().fetchInventory(item.official_id);
      
      set({ isLoading: false });
      toast.success('Elemento de inventario agregado con éxito');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al agregar elemento de inventario', 
        isLoading: false 
      });
      toast.error('Error al agregar elemento de inventario');
    }
  },
  
  updateInventoryItem: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      // Find the item to get its official_id
      const item = get().inventory.find(i => i.id === id);
      
      if (item) {
        // Refresh the inventory list
        await get().fetchInventory(item.official_id);
      }
      
      set({ isLoading: false });
      toast.success('Elemento de inventario actualizado con éxito');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar elemento de inventario', 
        isLoading: false 
      });
      toast.error('Error al actualizar elemento de inventario');
    }
  },
  
  deleteInventoryItem: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state by filtering out the deleted item
      set(state => ({
        inventory: state.inventory.filter(i => i.id !== id),
        isLoading: false
      }));
      
      toast.success('Elemento de inventario eliminado con éxito');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar elemento de inventario', 
        isLoading: false 
      });
      toast.error('Error al eliminar elemento de inventario');
    }
  },
  
  changeOfficialStatus: async (officialId, newStatus) => {
    try {
      set({ isLoading: true, error: null });
      
      // First get the official to check the current status and entry date
      const { data: officialData, error: officialError } = await supabase
        .from('officials')
        .select('*')
        .eq('id', officialId)
        .single();
      
      if (officialError) throw officialError;
      
      // Update the status
      const { error: updateError } = await supabase
        .from('officials')
        .update({ status: newStatus })
        .eq('id', officialId);
      
      if (updateError) throw updateError;
      
      // If changing from PROVISIONAL to POSITIONED, create new events
      if (officialData.status === 'PROVISIONAL' && newStatus === 'POSITIONED') {
        const entryDate = new Date(officialData.entry_date);
        const autoEvents = calculateAutoEvents(entryDate, 'POSITIONED');
        
        if (autoEvents.length > 0) {
          const eventsToInsert = autoEvents.map(event => ({
            official_id: officialId,
            event_type: event.event_type,
            scheduled_date: event.scheduled_date.toISOString(),
            completed: false,
            notes: null
          }));
          
          const { error: eventsError } = await supabase
            .from('official_events')
            .insert(eventsToInsert);
          
          if (eventsError) throw eventsError;
        }
      }
      
      // Refresh the officials list
      await get().fetchOfficials();
      
      // Also refresh events as they might have changed
      await get().fetchEvents(officialId);
      
      set({ isLoading: false });
      toast.success('Estado del funcionario actualizado con éxito');
    } catch (error) {
      console.error('Error changing official status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cambiar estado del funcionario', 
        isLoading: false 
      });
      toast.error('Error al cambiar estado del funcionario');
    }
  }
}));