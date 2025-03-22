
import { supabase } from '@/lib/supabase';
import { Boardgame, Event, Participation, User } from '@/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Database adapters - konvertieren zwischen App-Typen und Datenbank-Typen
const adaptBoardgameFromDb = (dbBoardgame: any): Boardgame => ({
  id: dbBoardgame.id,
  title: dbBoardgame.title,
  description: dbBoardgame.description,
  complexityRating: dbBoardgame.complexity_rating,
  videoUrl: dbBoardgame.video_url || undefined,
  bggUrl: dbBoardgame.bgg_url || undefined,
  imageUrl: dbBoardgame.image_url || undefined
});

const adaptBoardgameToDb = (boardgame: Omit<Boardgame, 'id'>) => ({
  title: boardgame.title,
  description: boardgame.description,
  complexity_rating: boardgame.complexityRating,
  video_url: boardgame.videoUrl || null,
  bgg_url: boardgame.bggUrl || null,
  image_url: boardgame.imageUrl || null
});

const adaptEventFromDb = (dbEvent: any): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description,
  date: new Date(dbEvent.date),
  boardgames: dbEvent.boardgames
});

const adaptEventToDb = (event: Omit<Event, 'id'>) => ({
  title: event.title,
  description: event.description,
  date: event.date.toISOString(),
  boardgames: event.boardgames
});

const adaptParticipationFromDb = (dbParticipation: any): Participation => ({
  userId: dbParticipation.user_id || undefined,
  attendeeName: dbParticipation.attendee_name || undefined,
  eventId: dbParticipation.event_id,
  attending: dbParticipation.attending,
  rankings: dbParticipation.rankings || undefined,
  excluded: dbParticipation.excluded || undefined
});

const adaptParticipationToDb = (participation: Participation) => ({
  user_id: participation.userId || null,
  attendee_name: participation.attendeeName || null,
  event_id: participation.eventId,
  attending: participation.attending,
  rankings: participation.rankings || null,
  excluded: participation.excluded || null
});

const adaptUserFromDb = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  isAdmin: dbUser.is_admin
});

const adaptUserToDb = (user: Omit<User, 'id'>) => ({
  name: user.name,
  is_admin: user.isAdmin
});

// Boardgame services
export const fetchBoardgames = async (): Promise<Boardgame[]> => {
  const { data, error } = await supabase
    .from('boardgames')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching boardgames:', error);
    throw error;
  }

  return data.map(adaptBoardgameFromDb);
};

export const createBoardgame = async (boardgame: Omit<Boardgame, 'id'>): Promise<Boardgame> => {
  const { data, error } = await supabase
    .from('boardgames')
    .insert(adaptBoardgameToDb(boardgame))
    .select()
    .single();

  if (error) {
    console.error('Error creating boardgame:', error);
    throw error;
  }

  return adaptBoardgameFromDb(data);
};

export const updateBoardgame = async (id: string, boardgame: Partial<Boardgame>): Promise<Boardgame> => {
  const updates: any = {};
  if (boardgame.title !== undefined) updates.title = boardgame.title;
  if (boardgame.description !== undefined) updates.description = boardgame.description;
  if (boardgame.complexityRating !== undefined) updates.complexity_rating = boardgame.complexityRating;
  if (boardgame.videoUrl !== undefined) updates.video_url = boardgame.videoUrl || null;
  if (boardgame.bggUrl !== undefined) updates.bgg_url = boardgame.bggUrl || null;
  if (boardgame.imageUrl !== undefined) updates.image_url = boardgame.imageUrl || null;

  const { data, error } = await supabase
    .from('boardgames')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating boardgame:', error);
    throw error;
  }

  return adaptBoardgameFromDb(data);
};

export const deleteBoardgame = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('boardgames')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting boardgame:', error);
    throw error;
  }
};

// Event services
export const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date');

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data.map(adaptEventFromDb);
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .insert(adaptEventToDb(event))
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return adaptEventFromDb(data);
};

export const updateEvent = async (id: string, event: Partial<Event>): Promise<Event> => {
  const updates: any = {};
  if (event.title !== undefined) updates.title = event.title;
  if (event.description !== undefined) updates.description = event.description;
  if (event.date !== undefined) updates.date = event.date.toISOString();
  if (event.boardgames !== undefined) updates.boardgames = event.boardgames;

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return adaptEventFromDb(data);
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Participation services
export const fetchParticipations = async (): Promise<Participation[]> => {
  const { data, error } = await supabase
    .from('participations')
    .select('*');

  if (error) {
    console.error('Error fetching participations:', error);
    throw error;
  }

  return data.map(adaptParticipationFromDb);
};

export const createOrUpdateParticipation = async (participation: Participation): Promise<Participation> => {
  // Suche nach existierender Teilnahme
  const query = supabase
    .from('participations')
    .select('*')
    .eq('event_id', participation.eventId);

  if (participation.userId) {
    query.eq('user_id', participation.userId);
  } else if (participation.attendeeName) {
    query.eq('attendee_name', participation.attendeeName);
  } else {
    throw new Error('Participation must have either userId or attendeeName');
  }

  const { data: existingData } = await query;

  if (existingData && existingData.length > 0) {
    // Update existierende Teilnahme
    const { data, error } = await supabase
      .from('participations')
      .update(adaptParticipationToDb(participation))
      .eq('id', existingData[0].id)
      .select()
      .single();

    if (error) {
      console.error('Error updating participation:', error);
      throw error;
    }

    return adaptParticipationFromDb(data);
  } else {
    // Erstelle neue Teilnahme
    const { data, error } = await supabase
      .from('participations')
      .insert(adaptParticipationToDb(participation))
      .select()
      .single();

    if (error) {
      console.error('Error creating participation:', error);
      throw error;
    }

    return adaptParticipationFromDb(data);
  }
};

export const updateParticipationRankings = async (
  userId: string | undefined, 
  attendeeName: string | undefined, 
  eventId: string, 
  rankings: Record<string, number>
): Promise<Participation> => {
  if (!userId && !attendeeName) {
    throw new Error('Either userId or attendeeName must be provided');
  }

  // Suche nach existierender Teilnahme
  const query = supabase
    .from('participations')
    .select('*')
    .eq('event_id', eventId);

  if (userId) {
    query.eq('user_id', userId);
  } else if (attendeeName) {
    query.eq('attendee_name', attendeeName);
  }

  const { data: existingData } = await query;

  if (existingData && existingData.length > 0) {
    // Update existierende Teilnahme
    const { data, error } = await supabase
      .from('participations')
      .update({ rankings })
      .eq('id', existingData[0].id)
      .select()
      .single();

    if (error) {
      console.error('Error updating participation rankings:', error);
      throw error;
    }

    return adaptParticipationFromDb(data);
  } else {
    // Erstelle neue Teilnahme mit Rankings
    const newParticipation = {
      user_id: userId || null,
      attendee_name: attendeeName || null,
      event_id: eventId,
      attending: true,
      rankings
    };

    const { data, error } = await supabase
      .from('participations')
      .insert(newParticipation)
      .select()
      .single();

    if (error) {
      console.error('Error creating participation with rankings:', error);
      throw error;
    }

    return adaptParticipationFromDb(data);
  }
};

export const updateParticipationExcluded = async (
  userId: string | undefined, 
  attendeeName: string | undefined, 
  eventId: string, 
  excluded: string[]
): Promise<Participation> => {
  if (!userId && !attendeeName) {
    throw new Error('Either userId or attendeeName must be provided');
  }

  // Suche nach existierender Teilnahme
  const query = supabase
    .from('participations')
    .select('*')
    .eq('event_id', eventId);

  if (userId) {
    query.eq('user_id', userId);
  } else if (attendeeName) {
    query.eq('attendee_name', attendeeName);
  }

  const { data: existingData } = await query;

  if (existingData && existingData.length > 0) {
    // Update existierende Teilnahme
    const { data, error } = await supabase
      .from('participations')
      .update({ excluded })
      .eq('id', existingData[0].id)
      .select()
      .single();

    if (error) {
      console.error('Error updating participation excluded games:', error);
      throw error;
    }

    return adaptParticipationFromDb(data);
  } else {
    // Erstelle neue Teilnahme mit ausgeschlossenen Spielen
    const newParticipation = {
      user_id: userId || null,
      attendee_name: attendeeName || null,
      event_id: eventId,
      attending: true,
      excluded
    };

    const { data, error } = await supabase
      .from('participations')
      .insert(newParticipation)
      .select()
      .single();

    if (error) {
      console.error('Error creating participation with excluded games:', error);
      throw error;
    }

    return adaptParticipationFromDb(data);
  }
};

// User services
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data.map(adaptUserFromDb);
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert(adaptUserToDb(user))
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return adaptUserFromDb(data);
};

// Subscription Services
export type SubscriptionCallback<T> = (payload: T) => void;

export const subscribeToBoardgames = (callback: SubscriptionCallback<Boardgame[]>) => {
  // Erst Daten holen
  fetchBoardgames().then(callback).catch(console.error);

  // Dann Subscription für Echtzeit-Updates erstellen
  const subscription = supabase
    .channel('boardgames-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'boardgames' 
      }, 
      () => {
        // Bei jeder Änderung alle Daten neu laden
        fetchBoardgames().then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Funktion zur Abmeldung zurückgeben
  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToEvents = (callback: SubscriptionCallback<Event[]>) => {
  // Erst Daten holen
  fetchEvents().then(callback).catch(console.error);

  // Dann Subscription für Echtzeit-Updates erstellen
  const subscription = supabase
    .channel('events-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'events' 
      }, 
      () => {
        // Bei jeder Änderung alle Daten neu laden
        fetchEvents().then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Funktion zur Abmeldung zurückgeben
  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToParticipations = (callback: SubscriptionCallback<Participation[]>) => {
  // Erst Daten holen
  fetchParticipations().then(callback).catch(console.error);

  // Dann Subscription für Echtzeit-Updates erstellen
  const subscription = supabase
    .channel('participations-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'participations' 
      }, 
      () => {
        // Bei jeder Änderung alle Daten neu laden
        fetchParticipations().then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Funktion zur Abmeldung zurückgeben
  return () => {
    supabase.removeChannel(subscription);
  };
};

export const subscribeToUsers = (callback: SubscriptionCallback<User[]>) => {
  // Erst Daten holen
  fetchUsers().then(callback).catch(console.error);

  // Dann Subscription für Echtzeit-Updates erstellen
  const subscription = supabase
    .channel('users-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, 
      () => {
        // Bei jeder Änderung alle Daten neu laden
        fetchUsers().then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Funktion zur Abmeldung zurückgeben
  return () => {
    supabase.removeChannel(subscription);
  };
};

// Helfer für Initialladung der Daten
export const initializeDatabase = async () => {
  try {
    // Prüfe, ob Daten bereits vorhanden sind
    const { count: boardgamesCount } = await supabase
      .from('boardgames')
      .select('*', { count: 'exact', head: true });

    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Wenn keine Daten vorhanden, initialisiere mit Demo-Daten
    if (boardgamesCount === 0) {
      const initialBoardgames = [
        {
          title: 'Catan',
          description: 'Build settlements, trade resources, and compete for longest road in this classic strategy game.',
          complexity_rating: 2.3,
          bgg_url: 'https://boardgamegeek.com/boardgame/13/catan',
          video_url: 'https://www.youtube.com/watch?v=cPhX_1RiwEg',
          image_url: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__imagepage/img/M_3Vg1j2HlNgkv7PL2xl2BJE2bw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2419375.jpg'
        },
        {
          title: 'Ticket to Ride',
          description: 'Collect cards, build train routes, and connect cities across North America in this railway adventure.',
          complexity_rating: 1.8,
          bgg_url: 'https://boardgamegeek.com/boardgame/9209/ticket-ride',
          video_url: 'https://www.youtube.com/watch?v=4JhFhyvGdik',
          image_url: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__imagepage/img/FcSGmLeIStNfKMMCh_nWTBkMIQM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic38668.jpg'
        },
        {
          title: 'Gloomhaven',
          description: 'A campaign-based dungeon crawl game with legacy elements and tactical combat.',
          complexity_rating: 3.9,
          bgg_url: 'https://boardgamegeek.com/boardgame/174430/gloomhaven',
          video_url: 'https://www.youtube.com/watch?v=mKc5XhvkR6Y',
          image_url: 'https://cf.geekdo-images.com/sZYp_3BTDGjh2unaZfZmuA__imagepage/img/Go-ks7YXaLPDLkyl5-sYnfA_QXs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2437871.jpg'
        }
      ];

      await supabase.from('boardgames').insert(initialBoardgames);
      console.log('Initialized boardgames');
    }

    if (usersCount === 0) {
      const initialUsers = [
        { name: 'Admin User', is_admin: true },
        { name: 'Regular User', is_admin: false },
      ];

      await supabase.from('users').insert(initialUsers);
      console.log('Initialized users');
    }

    if (eventsCount === 0) {
      // Hole Boardgame-IDs für das Event
      const { data: boardgames } = await supabase
        .from('boardgames')
        .select('id')
        .limit(2);

      if (boardgames && boardgames.length > 0) {
        const initialEvents = [
          {
            title: 'Saturday Game Night',
            description: 'Weekly gaming session with a focus on strategy games',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 Woche ab jetzt
            boardgames: boardgames.map(bg => bg.id)
          }
        ];

        await supabase.from('events').insert(initialEvents);
        console.log('Initialized events');
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
