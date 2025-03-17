import React, { createContext, useContext, useState, useEffect } from 'react';
import { Boardgame, Event, Participation, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
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
  updateRankings: (userId: string, eventId: string, rankings: Record<string, number>) => void;
  updateExcluded: (userId: string, eventId: string, excluded: string[]) => void;
  
  // User functions
  login: (userId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  const addBoardgame = (boardgame: Omit<Boardgame, 'id'>) => {
    const newBoardgame = {
      ...boardgame,
      id: Date.now().toString(),
    };
    setBoardgames([...boardgames, newBoardgame]);
    toast({
      title: "Boardgame Added",
      description: `${newBoardgame.title} has been added to the collection.`
    });
  };

  const updateBoardgame = (id: string, updates: Partial<Boardgame>) => {
    setBoardgames(
      boardgames.map(bg => (bg.id === id ? { ...bg, ...updates } : bg))
    );
    toast({
      title: "Boardgame Updated",
      description: `The boardgame has been updated successfully.`
    });
  };

  const deleteBoardgame = (id: string) => {
    const boardgameToDelete = boardgames.find(bg => bg.id === id);
    setBoardgames(boardgames.filter(bg => bg.id !== id));
    
    setEvents(
      events.map(event => ({
        ...event,
        boardgames: event.boardgames.filter(bgId => bgId !== id)
      }))
    );
    
    toast({
      title: "Boardgame Removed",
      description: `${boardgameToDelete?.title || 'The boardgame'} has been removed.`
    });
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents([...events, newEvent]);
    toast({
      title: "Event Created",
      description: `${newEvent.title} has been scheduled.`
    });
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(
      events.map(event => (event.id === id ? { ...event, ...updates } : event))
    );
    toast({
      title: "Event Updated",
      description: `The event has been updated successfully.`
    });
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    setEvents(events.filter(event => event.id !== id));
    
    setParticipations(
      participations.filter(p => p.eventId !== id)
    );
    
    toast({
      title: "Event Deleted",
      description: `${eventToDelete?.title || 'The event'} has been removed.`
    });
  };

  const setParticipation = (userId: string, eventId: string, attending: boolean) => {
    const existingIndex = participations.findIndex(
      p => p.userId === userId && p.eventId === eventId
    );

    if (existingIndex >= 0) {
      const updatedParticipations = [...participations];
      updatedParticipations[existingIndex] = {
        ...updatedParticipations[existingIndex],
        attending
      };
      setParticipations(updatedParticipations);
    } else {
      setParticipations([
        ...participations,
        { userId, eventId, attending }
      ]);
    }
    
    toast({
      title: attending ? "You're Going!" : "RSVP Updated",
      description: attending 
        ? "You've been added to the event attendees." 
        : "You've been removed from the event attendees."
    });
  };

  const updateRankings = (userId: string, eventId: string, rankings: Record<string, number>) => {
    const existingIndex = participations.findIndex(
      p => p.userId === userId && p.eventId === eventId
    );

    if (existingIndex >= 0) {
      const updatedParticipations = [...participations];
      updatedParticipations[existingIndex] = {
        ...updatedParticipations[existingIndex],
        rankings
      };
      setParticipations(updatedParticipations);
    }
    
    toast({
      title: "Preferences Saved",
      description: "Your game preferences have been updated."
    });
  };

  const updateExcluded = (userId: string, eventId: string, excluded: string[]) => {
    const existingIndex = participations.findIndex(
      p => p.userId === userId && p.eventId === eventId
    );

    if (existingIndex >= 0) {
      const updatedParticipations = [...participations];
      updatedParticipations[existingIndex] = {
        ...updatedParticipations[existingIndex],
        excluded
      };
      setParticipations(updatedParticipations);
    }
    
    toast({
      title: "Exclusions Saved",
      description: "Your game exclusions have been updated."
    });
  };

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

  return (
    <AppContext.Provider
      value={{
        boardgames,
        events,
        participations,
        users,
        currentUser,
        addBoardgame,
        updateBoardgame,
        deleteBoardgame,
        addEvent,
        updateEvent,
        deleteEvent,
        setParticipation,
        updateRankings,
        updateExcluded,
        login,
        logout
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
