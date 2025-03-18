
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types';
import { ToastType } from '@/hooks/use-toast';

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
  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', userId);
      toast({
        title: "Logged In",
        description: `Welcome, ${user.name}!`
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully."
    });
  };

  return { login, logout };
};
