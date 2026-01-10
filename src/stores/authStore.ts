import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  checkUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch detailed user profile from 'users' table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          set({ user: profile });
        } else {
            // Profile missing (e.g. created before trigger was added), create it now
            const newProfile: User = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata.name || session.user.email!.split('@')[0],
                role: 'employee',
                department: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { error: insertError } = await supabase
               .from('users')
               .insert([newProfile]);
               
            if (!insertError) {
                set({ user: newProfile });
            } else {
                console.error('Error creating user profile:', insertError);
                set({ user: null });
            }
        }
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
