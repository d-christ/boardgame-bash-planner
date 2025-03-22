
import { Dispatch, SetStateAction } from 'react';
import { Event, Participation } from '@/types';
import { ToastType } from '@/hooks/use-toast';
import * as supabaseService from '@/services/supabaseService';

interface UseEventActionsProps {
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
  participations: Participation[];
  setParticipations: Dispatch<SetStateAction<Participation[]>>;
  toast: ToastType;
}

export const useEventActions = ({
  events,
  setEvents,
  participations,
  setParticipations,
  toast
}: UseEventActionsProps) => {
  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const newEvent = await supabaseService.createEvent(event);
      setEvents(prev => [...prev, newEvent]);
      toast({
        title: "Event Created",
        description: `${newEvent.title} has been scheduled.`
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      await supabaseService.updateEvent(id, updates);
      setEvents(prev =>
        prev.map(event => (event.id === id ? { ...event, ...updates } : event))
      );
      toast({
        title: "Event Updated",
        description: `The event has been updated successfully.`
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const eventToDelete = events.find(e => e.id === id);
      await supabaseService.deleteEvent(id);
      
      setEvents(prev => prev.filter(event => event.id !== id));
      
      // Participations für dieses Event löschen wird automatisch durch Echtzeit-Updates behandelt
      // da die Participations mit Realtime-Subscriptions aktualisiert werden
      // Wir aktualisieren trotzdem den lokalen State, um sofortige UI-Aktualisierung zu gewährleisten
      setParticipations(prev => prev.filter(p => p.eventId !== id));
      
      toast({
        title: "Event Deleted",
        description: `${eventToDelete?.title || 'The event'} has been removed.`
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { addEvent, updateEvent, deleteEvent };
};
