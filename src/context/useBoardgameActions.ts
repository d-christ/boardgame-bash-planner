
import { Dispatch, SetStateAction } from 'react';
import { Boardgame, Event } from '@/types';
import { ToastType } from '@/hooks/use-toast';

interface UseBoardgameActionsProps {
  boardgames: Boardgame[];
  setBoardgames: Dispatch<SetStateAction<Boardgame[]>>;
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
  toast: ToastType;
}

export const useBoardgameActions = ({
  boardgames,
  setBoardgames,
  events,
  setEvents,
  toast
}: UseBoardgameActionsProps) => {
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

  return { addBoardgame, updateBoardgame, deleteBoardgame };
};
