
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Boardgame, Event, Participation, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useBoardgameActions } from './useBoardgameActions';
import { useEventActions } from './useEventActions';
import { useParticipationActions } from './useParticipationActions';
import { useUserActions } from './useUserActions';
import * as supabaseService from '@/services/supabaseService';

export interface AppContextType {
  // Data
  boardgames: Boardgame[];
  events: Event[];
  participations: Participation[];
  users: User[];
  currentUser: User | null;
  
  // Boardgame functions
  addBoardgame: (boardgame: Omit<Boardgame, 'id'>) => void;
  updateBoardgame: (id: string, boardgame: Partial<Boardgame>) => void;
  deleteBoardgame: (id: string) => void;
  
  // Event functions
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Participation functions
  setParticipation: (userId: string, eventId: string, attending: boolean) => void;
  setAttendanceByName: (name: string, eventId: string, attending: boolean, userId?: string) => void;
  updateRankings: (userId: string, eventId: string, rankings: Record<string, number>) => void;
  updateExcluded: (userId: string, eventId: string, excluded: string[]) => void;
  
  // User functions
  login: (userId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [boardgames, setBoardgames] = useState<Boardgame[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    return null; // Wir setzen später den aktuellen Benutzer, wenn die Benutzerdaten geladen sind
  });

  // Initialize Supabase and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialisiere Datenbank mit Demo-Daten, falls leer
        await supabaseService.initializeDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        toast({
          title: "Initialization Error",
          description: "Could not initialize the application. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    initializeApp();
  }, [toast]);

  // Set up Supabase subscriptions
  useEffect(() => {
    if (!isInitialized) return;

    const boardgamesUnsub = supabaseService.subscribeToBoardgames(setBoardgames);
    const eventsUnsub = supabaseService.subscribeToEvents(setEvents);
    const participationsUnsub = supabaseService.subscribeToParticipations(setParticipations);
    const usersUnsub = supabaseService.subscribeToUsers((newUsers) => {
      setUsers(newUsers);
      
      // Setze den aktuellen Benutzer, wenn Benutzerdaten geladen sind
      const savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId) {
        const user = newUsers.find(u => u.id === savedUserId);
        if (user) {
          setCurrentUser(user);
        }
      }
    });

    // Cleanup subscriptions
    return () => {
      boardgamesUnsub();
      eventsUnsub();
      participationsUnsub();
      usersUnsub();
    };
  }, [isInitialized]);

  // Initialize action hooks
  const boardgameActions = useBoardgameActions({
    boardgames,
    setBoardgames,
    events,
    setEvents,
    toast
  });

  const eventActions = useEventActions({
    events,
    setEvents,
    participations,
    setParticipations,
    toast
  });

  const participationActions = useParticipationActions({
    participations,
    setParticipations,
    toast
  });

  const userActions = useUserActions({
    users,
    setCurrentUser,
    toast
  });

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Loading Boardgame Bash...</h1>
          <p className="text-muted-foreground">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        boardgames,
        events,
        participations,
        users,
        currentUser,
        ...boardgameActions,
        ...eventActions,
        ...participationActions,
        ...userActions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
