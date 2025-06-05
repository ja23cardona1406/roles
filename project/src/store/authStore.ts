import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Get additional user data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        set({ user: userData, isLoading: false });
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error de inicio de sesión', 
        isLoading: false 
      });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Error during sign out:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cerrar sesión', 
        isLoading: false 
      });
    }
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });
      
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        // Get additional user data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        set({ user: userData, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      set({ 
        user: null, 
        error: error instanceof Error ? error.message : 'Error al verificar sesión', 
        isLoading: false 
      });
    }
  },
}));