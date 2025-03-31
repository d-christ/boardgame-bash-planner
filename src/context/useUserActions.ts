
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types';
import { ToastType } from '@/hooks/use-toast';
import * as supabaseService from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

interface UseUserActionsProps {
  users: User[];
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  toast: ToastType;
}

export const useUserActions = ({
  users,
  setCurrentUser,
  toast
}: UseUserActionsProps) => {
  const login = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (user) {
      try {
        // For the admin user with specific credentials
        if (user.isAdmin && user.name === 'Admin User') {
          // First check if the admin user exists
          const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@boardgamebash.com',
            password: 'admin123'
          });
          
          // If login fails, try to create the admin user
          if (signInError && signInError.status === 400) {
            console.log("Admin login failed, attempting to create admin user...");
            const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
              email: 'admin@boardgamebash.com',
              password: 'admin123'
            });
            
            if (signUpError) {
              throw signUpError;
            }
            
            // After signup, try login again
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email: 'admin@boardgamebash.com',
              password: 'admin123'
            });
            
            if (retryError) {
              throw retryError;
            }
            
            console.log("Admin user created and logged in successfully");
          }
        }
        
        // Set the current user in state
        setCurrentUser(user);
        
        // Store user ID in local storage for persistence
        localStorage.setItem('currentUserId', user.id);
        
        toast({
          title: "Logged In",
          description: `Welcome, ${user.name}!`
        });
      } catch (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message || "There was an error logging in. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Update app state
      setCurrentUser(null);
      
      // Remove from local storage
      localStorage.removeItem('currentUserId');
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully."
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { login, logout };
};
