
import { Dispatch, SetStateAction } from 'react';
import { Participation } from '@/types';
import { ToastType } from '@/hooks/use-toast';

interface UseParticipationActionsProps {
  participations: Participation[];
  setParticipations: Dispatch<SetStateAction<Participation[]>>;
  toast: ToastType;
}

export const useParticipationActions = ({
  participations,
  setParticipations,
  toast
}: UseParticipationActionsProps) => {
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

  const setAttendanceByName = (name: string, eventId: string, attending: boolean, userId?: string) => {
    const existingIndex = participations.findIndex(
      p => p.eventId === eventId && 
        ((userId && p.userId === userId) || 
         (!userId && p.attendeeName === name))
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
        { userId, attendeeName: !userId ? name : undefined, eventId, attending }
      ]);
    }
    
    toast({
      title: attending ? "RSVP Confirmed!" : "RSVP Cancelled",
      description: attending 
        ? `${name} has been added to the event attendees.` 
        : `${name} has been removed from the event attendees.`
    });
  };

  const updateRankings = (userId: string, eventId: string, rankings: Record<string, number>) => {
    console.log("Updating rankings:", userId, eventId, rankings);
    
    // Check if this is a guest user or a logged-in user
    const isGuestParticipation = !participations.some(p => p.userId === userId);
    
    if (isGuestParticipation) {
      // For guest participants, find by name instead
      const existingIndex = participations.findIndex(
        p => p.attendeeName === userId && p.eventId === eventId
      );
      
      console.log("Guest participation index:", existingIndex, "Name:", userId);
      
      if (existingIndex >= 0) {
        const updatedParticipations = [...participations];
        updatedParticipations[existingIndex] = {
          ...updatedParticipations[existingIndex],
          rankings
        };
        console.log("Updated participation:", updatedParticipations[existingIndex]);
        setParticipations(updatedParticipations);
      }
    } else {
      // For logged-in users, use userId as before
      const existingIndex = participations.findIndex(
        p => p.userId === userId && p.eventId === eventId
      );

      console.log("User participation index:", existingIndex, "ID:", userId);

      if (existingIndex >= 0) {
        const updatedParticipations = [...participations];
        updatedParticipations[existingIndex] = {
          ...updatedParticipations[existingIndex],
          rankings
        };
        console.log("Updated participation:", updatedParticipations[existingIndex]);
        setParticipations(updatedParticipations);
      }
    }
    
    toast({
      title: "Preferences Saved",
      description: "Your game preferences have been updated."
    });
  };

  const updateExcluded = (userId: string, eventId: string, excluded: string[]) => {
    // Check if this is a guest user or a logged-in user
    const isGuestParticipation = !participations.some(p => p.userId === userId);
    
    if (isGuestParticipation) {
      // For guest participants, find by name instead
      const existingIndex = participations.findIndex(
        p => p.attendeeName === userId && p.eventId === eventId
      );
      
      if (existingIndex >= 0) {
        const updatedParticipations = [...participations];
        updatedParticipations[existingIndex] = {
          ...updatedParticipations[existingIndex],
          excluded
        };
        setParticipations(updatedParticipations);
      }
    } else {
      // For logged-in users, use userId as before
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
    }
    
    toast({
      title: "Exclusions Saved",
      description: "Your game exclusions have been updated."
    });
  };

  return { setParticipation, setAttendanceByName, updateRankings, updateExcluded };
};
