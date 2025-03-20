
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
    
    let participationIndex = -1;
    
    // First try to find by userId for logged-in users
    if (userId) {
      participationIndex = participations.findIndex(
        p => p.userId === userId && p.eventId === eventId
      );
    }
    
    // If not found and might be a guest (userId is actually the attendee name)
    if (participationIndex === -1) {
      participationIndex = participations.findIndex(
        p => p.attendeeName === userId && p.eventId === eventId
      );
    }
    
    console.log("Participation index:", participationIndex);
    
    if (participationIndex >= 0) {
      // Create a deep copy of the participations array
      const updatedParticipations = [...participations];
      
      // Update the rankings for the found participation
      const updatedParticipation = {
        ...updatedParticipations[participationIndex],
        rankings
      };
      
      updatedParticipations[participationIndex] = updatedParticipation;
      
      console.log("Updated participation:", updatedParticipation);
      setParticipations(updatedParticipations);
      
      // Save to localStorage immediately to ensure persistence
      localStorage.setItem('participations', JSON.stringify(updatedParticipations));
      
      toast({
        title: "Preferences Saved",
        description: "Your game preferences have been updated."
      });
    } else {
      console.error("No participation found for userId/name:", userId);
      toast({
        title: "Error Saving Preferences",
        description: "Unable to find your RSVP record. Please try again or contact the organizer.",
        variant: "destructive"
      });
    }
  };

  const updateExcluded = (userId: string, eventId: string, excluded: string[]) => {
    let participationIndex = -1;
    
    // First try to find by userId for logged-in users
    if (userId) {
      participationIndex = participations.findIndex(
        p => p.userId === userId && p.eventId === eventId
      );
    }
    
    // If not found and might be a guest (userId is actually the attendee name)
    if (participationIndex === -1) {
      participationIndex = participations.findIndex(
        p => p.attendeeName === userId && p.eventId === eventId
      );
    }
    
    if (participationIndex >= 0) {
      const updatedParticipations = [...participations];
      updatedParticipations[participationIndex] = {
        ...updatedParticipations[participationIndex],
        excluded
      };
      setParticipations(updatedParticipations);
      
      toast({
        title: "Exclusions Saved",
        description: "Your game exclusions have been updated."
      });
    } else {
      toast({
        title: "Error Saving Exclusions",
        description: "Unable to find your RSVP record. Please try again or contact the organizer.",
        variant: "destructive"
      });
    }
  };

  return { setParticipation, setAttendanceByName, updateRankings, updateExcluded };
};
