
import { Dispatch, SetStateAction } from 'react';
import { Event, Participation } from '@/types';
import { ToastType } from '@/hooks/use-toast';

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

  return { addEvent, updateEvent, deleteEvent };
};
