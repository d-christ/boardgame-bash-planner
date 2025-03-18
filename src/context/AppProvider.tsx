
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Boardgame, Event, Participation, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useBoardgameActions } from './useBoardgameActions';
import { useEventActions } from './useEventActions';
import { useParticipationActions } from './useParticipationActions';
import { useUserActions } from './useUserActions';

// Mock users for demo purposes
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', isAdmin: true },
  { id: '2', name: 'Regular User', isAdmin: false },
];

// Sample boardgames for demo
const initialBoardgames: Boardgame[] = [
  {
    id: '1',
    title: 'Catan',
    description: 'Build settlements, trade resources, and compete for longest road in this classic strategy game.',
    complexityRating: 2.3,
    bggUrl: 'https://boardgamegeek.com/boardgame/13/catan',
    videoUrl: 'https://www.youtube.com/watch?v=cPhX_1RiwEg',
    imageUrl: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__imagepage/img/M_3Vg1j2HlNgkv7PL2xl2BJE2bw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2419375.jpg'
  },
  {
    id: '2',
    title: 'Ticket to Ride',
    description: 'Collect cards, build train routes, and connect cities across North America in this railway adventure.',
    complexityRating: 1.8,
    bggUrl: 'https://boardgamegeek.com/boardgame/9209/ticket-ride',
    videoUrl: 'https://www.youtube.com/watch?v=4JhFhyvGdik',
    imageUrl: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__imagepage/img/FcSGmLeIStNfKMMCh_nWTBkMIQM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic38668.jpg'
  },
  {
    id: '3',
    title: 'Gloomhaven',
    description: 'A campaign-based dungeon crawl game with legacy elements and tactical combat.',
    complexityRating: 3.9,
    bggUrl: 'https://boardgamegeek.com/boardgame/174430/gloomhaven',
    videoUrl: 'https://www.youtube.com/watch?v=mKc5XhvkR6Y',
    imageUrl: 'https://cf.geekdo-images.com/sZYp_3BTDGjh2unaZfZmuA__imagepage/img/Go-ks7YXaLPDLkyl5-sYnfA_QXs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2437871.jpg'
  }
];

// Sample events for demo
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Saturday Game Night',
    description: 'Weekly gaming session with a focus on strategy games',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    boardgames: ['1', '2']
  }
];

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
  const [boardgames, setBoardgames] = useState<Boardgame[]>(() => {
    const saved = localStorage.getItem('boardgames');
    return saved ? JSON.parse(saved) : initialBoardgames;
  });
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : initialEvents;
  });
  
  const [participations, setParticipations] = useState<Participation[]>(() => {
    const saved = localStorage.getItem('participations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [users] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      return mockUsers.find(u => u.id === savedUserId) || null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('boardgames', JSON.stringify(boardgames));
  }, [boardgames]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('participations', JSON.stringify(participations));
  }, [participations]);

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
