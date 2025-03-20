
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

  // Completely reimplemented ranking update function
  const updateRankings = (userId: string, eventId: string, rankings: Record<string, number>) => {
    console.log("Starting rankings update for user/guest:", userId, "Event:", eventId);
    console.log("New rankings to save:", rankings);
    
    // Create a new array to avoid mutation
    const newParticipations = [...participations];
    
    // First, try to find the participant by userId if it's a logged-in user
    let participantIndex = -1;
    if (userId) {
      participantIndex = newParticipations.findIndex(
        p => p.userId === userId && p.eventId === eventId
      );
    }
    
    // If not found and might be a guest
    if (participantIndex === -1) {
      participantIndex = newParticipations.findIndex(
        p => p.attendeeName === userId && p.eventId === eventId
      );
    }
    
    console.log("Found participant at index:", participantIndex);
    
    if (participantIndex === -1) {
      // No participation record found
      console.error("No participation record found for:", userId);
      toast({
        title: "Error Saving Preferences",
        description: "Unable to find your RSVP record. Please try again or contact the organizer.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a completely new object for the updated participation
    const updatedParticipation = {
      ...newParticipations[participantIndex],
      rankings: { ...rankings } // Make a copy of the rankings
    };
    
    // Replace the participation with our new one
    newParticipations[participantIndex] = updatedParticipation;
    
    console.log("Updated participation record:", updatedParticipation);
    
    // Update state with the new array
    setParticipations(newParticipations);
    
    // Immediately update localStorage for persistence
    localStorage.setItem('participations', JSON.stringify(newParticipations));
    
    toast({
      title: "Preferences Saved",
      description: "Your game preferences have been updated."
    });
  };

  const updateExcluded = (userId: string, eventId: string, excluded: string[]) => {
    console.log("Starting exclusions update for user/guest:", userId, "Event:", eventId);
    console.log("New exclusions to save:", excluded);
    
    // Create a new array to avoid mutation
    const newParticipations = [...participations];
    
    // Try to find the participant by userId if it's a logged-in user
    let participantIndex = -1;
    if (userId) {
      participantIndex = newParticipations.findIndex(
        p => p.userId === userId && p.eventId === eventId
      );
    }
    
    // If not found and might be a guest
    if (participantIndex === -1) {
      participantIndex = newParticipations.findIndex(
        p => p.attendeeName === userId && p.eventId === eventId
      );
    }
    
    console.log("Found participant at index:", participantIndex);
    
    if (participantIndex === -1) {
      // No participation record found
      console.error("No participation record found for:", userId);
      toast({
        title: "Error Saving Exclusions",
        description: "Unable to find your RSVP record. Please try again or contact the organizer.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a completely new object for the updated participation
    const updatedParticipation = {
      ...newParticipations[participantIndex],
      excluded: [...excluded] // Make a copy of the excluded array
    };
    
    // Replace the participation with our new one
    newParticipations[participantIndex] = updatedParticipation;
    
    console.log("Updated participation record:", updatedParticipation);
    
    // Update state with the new array
    setParticipations(newParticipations);
    
    // Immediately update localStorage for persistence
    localStorage.setItem('participations', JSON.stringify(newParticipations));
    
    toast({
      title: "Exclusions Saved",
      description: "Your game exclusions have been updated."
    });
  };

  return { setParticipation, setAttendanceByName, updateRankings, updateExcluded };
};
