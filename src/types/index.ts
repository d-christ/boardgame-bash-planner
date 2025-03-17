

export interface Boardgame {
  id: string;
  title: string;
  description: string;
  complexityRating: number; // BGG complexity rating (1-5 scale)
  videoUrl?: string;
  bggUrl?: string;
  imageUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  boardgames: string[]; // Array of boardgame IDs
}

export interface Participation {
  userId: string;
  eventId: string;
  attending: boolean;
  rankings?: Record<string, number>; // boardgameId -> rank (1 = highest preference)
  excluded?: string[]; // Array of boardgame IDs the user doesn't want to play
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

