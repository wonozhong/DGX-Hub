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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        set({ user: null });
        return;
      }

      if (session?.user) {
        // Fetch detailed user profile from 'users' table
        const { data: profile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          set({ user: profile });
        } else {
            // If fetch failed, check if it's because it doesn't exist or other error
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching user profile:', fetchError);
                // Don't give up yet, maybe try to insert anyway if it's a missing profile issue masked by something else
            }

            // Profile missing (e.g. created before trigger was added), create it now
            const newProfile: User = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata.name || session.user.email!.split('@')[0],
                role: 'employee',
                department: null,
                phone_number: session.user.user_metadata.phone_number || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data: insertedUser, error: insertError } = await supabase
               .from('users')
               .insert([newProfile])
               .select()
               .single();
               
            if (!insertError && insertedUser) {
                set({ user: insertedUser });
            } else {
                console.error('Error creating user profile:', insertError);
                
                // If insert failed because it already exists (duplicate key), but select failed earlier...
                // This implies RLS might be blocking SELECT but constraint blocked INSERT.
                // Or simply a race condition.
                // In this worst case, we can try to set user from session data as a fallback so they can at least login?
                // But the app relies on 'role' and other fields from DB.
                // Let's fallback to a basic user object derived from session to allow login, 
                // but features requiring DB access might fail if RLS is the root cause.
                
                if (insertError?.code === '23505') { // Unique violation
                    console.warn('User exists but could not be selected. RLS issue?');
                    set({ user: newProfile }); // Optimistic set
                } else {
                    set({ user: null });
                }
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
