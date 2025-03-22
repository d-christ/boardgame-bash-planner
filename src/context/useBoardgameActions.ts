
import { Dispatch, SetStateAction } from 'react';
import { Boardgame, Event } from '@/types';
import { ToastType } from '@/hooks/use-toast';
import * as supabaseService from '@/services/supabaseService';

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
  const addBoardgame = async (boardgame: Omit<Boardgame, 'id'>) => {
    try {
      const newBoardgame = await supabaseService.createBoardgame(boardgame);
      setBoardgames(prev => [...prev, newBoardgame]);
      toast({
        title: "Boardgame Added",
        description: `${newBoardgame.title} has been added to the collection.`
      });
    } catch (error) {
      console.error('Error adding boardgame:', error);
      toast({
        title: "Error",
        description: "Failed to add boardgame. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateBoardgame = async (id: string, updates: Partial<Boardgame>) => {
    try {
      await supabaseService.updateBoardgame(id, updates);
      setBoardgames(prev => 
        prev.map(bg => (bg.id === id ? { ...bg, ...updates } : bg))
      );
      toast({
        title: "Boardgame Updated",
        description: `The boardgame has been updated successfully.`
      });
    } catch (error) {
      console.error('Error updating boardgame:', error);
      toast({
        title: "Error",
        description: "Failed to update boardgame. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteBoardgame = async (id: string) => {
    try {
      const boardgameToDelete = boardgames.find(bg => bg.id === id);
      await supabaseService.deleteBoardgame(id);
      
      setBoardgames(prev => prev.filter(bg => bg.id !== id));
      
      // Update any events that reference this boardgame
      const updatedEvents = events.map(event => ({
        ...event,
        boardgames: event.boardgames.filter(bgId => bgId !== id)
      }));
      
      // Anstelle von Massenupdate im Speicher, aktualisieren wir jeden betroffenen Event in der Datenbank
      const eventsToUpdate = events.filter(event => event.boardgames.includes(id));
      for (const event of eventsToUpdate) {
        await supabaseService.updateEvent(event.id, {
          ...event,
          boardgames: event.boardgames.filter(bgId => bgId !== id)
        });
      }
      
      setEvents(updatedEvents);
      
      toast({
        title: "Boardgame Removed",
        description: `${boardgameToDelete?.title || 'The boardgame'} has been removed.`
      });
    } catch (error) {
      console.error('Error deleting boardgame:', error);
      toast({
        title: "Error",
        description: "Failed to delete boardgame. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { addBoardgame, updateBoardgame, deleteBoardgame };
};
