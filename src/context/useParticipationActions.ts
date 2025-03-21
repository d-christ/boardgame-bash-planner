
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
    console.log("[RANKINGS] Starting update with:", { userId, eventId, rankings });
    
    // Create a fresh copy of participations
    const updatedParticipations = [...participations];
    
    // Find the participant by userId OR attendeeName
    const participantIndex = updatedParticipations.findIndex(
      p => p.eventId === eventId && (p.userId === userId || p.attendeeName === userId)
    );
    
    if (participantIndex === -1) {
      console.error("[RANKINGS] No participation found for", userId, "in event", eventId);
      toast({
        title: "Error Saving Preferences",
        description: "Could not find your participation record.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[RANKINGS] Found participant at index:", participantIndex);
    console.log("[RANKINGS] Current participation:", updatedParticipations[participantIndex]);
    
    // Create a completely new object to ensure state update
    const updatedParticipation = {
      ...updatedParticipations[participantIndex],
      rankings
    };
    
    console.log("[RANKINGS] New participation object:", updatedParticipation);
    
    // Update the array
    updatedParticipations[participantIndex] = updatedParticipation;
    
    // Update state
    setParticipations(updatedParticipations);
    
    // Explicitly save to localStorage
    console.log("[RANKINGS] Saving to localStorage:", JSON.stringify(updatedParticipations));
    localStorage.setItem('participations', JSON.stringify(updatedParticipations));
    
    toast({
      title: "Preferences Saved",
      description: "Your game rankings have been updated successfully."
    });
  };

  const updateExcluded = (userId: string, eventId: string, excluded: string[]) => {
    console.log("[EXCLUSIONS] Starting update with:", { userId, eventId, excluded });
    
    // Create a fresh copy of participations
    const updatedParticipations = [...participations];
    
    // Find the participant by userId OR attendeeName
    const participantIndex = updatedParticipations.findIndex(
      p => p.eventId === eventId && (p.userId === userId || p.attendeeName === userId)
    );
    
    if (participantIndex === -1) {
      console.error("[EXCLUSIONS] No participation found for", userId, "in event", eventId);
      toast({
        title: "Error Saving Exclusions",
        description: "Could not find your participation record.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[EXCLUSIONS] Found participant at index:", participantIndex);
    console.log("[EXCLUSIONS] Current participation:", updatedParticipations[participantIndex]);
    
    // Create a completely new object to ensure state update
    const updatedParticipation = {
      ...updatedParticipations[participantIndex],
      excluded
    };
    
    console.log("[EXCLUSIONS] New participation object:", updatedParticipation);
    
    // Update the array
    updatedParticipations[participantIndex] = updatedParticipation;
    
    // Update state
    setParticipations(updatedParticipations);
    
    // Explicitly save to localStorage
    console.log("[EXCLUSIONS] Saving to localStorage:", JSON.stringify(updatedParticipations));
    localStorage.setItem('participations', JSON.stringify(updatedParticipations));
    
    toast({
      title: "Exclusions Saved",
      description: "Your game exclusions have been updated successfully."
    });
  };

  return { setParticipation, setAttendanceByName, updateRankings, updateExcluded };
};
