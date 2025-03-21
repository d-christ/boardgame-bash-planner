
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
  const persistParticipations = (updatedParticipations: Participation[]) => {
    // Update state first
    setParticipations(updatedParticipations);
    
    // Then explicitly save to localStorage
    try {
      localStorage.setItem('participations', JSON.stringify(updatedParticipations));
      console.log("[PERSISTENCE] Successfully saved participations to localStorage", updatedParticipations);
    } catch (error) {
      console.error("[PERSISTENCE] Failed to save participations to localStorage:", error);
      toast({
        title: "Save Error",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const setParticipation = (userId: string, eventId: string, attending: boolean) => {
    const existingIndex = participations.findIndex(
      p => p.userId === userId && p.eventId === eventId
    );

    const updatedParticipations = [...participations];
    
    if (existingIndex >= 0) {
      updatedParticipations[existingIndex] = {
        ...updatedParticipations[existingIndex],
        attending
      };
    } else {
      updatedParticipations.push({ userId, eventId, attending });
    }
    
    persistParticipations(updatedParticipations);
    
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

    const updatedParticipations = [...participations];
    
    if (existingIndex >= 0) {
      updatedParticipations[existingIndex] = {
        ...updatedParticipations[existingIndex],
        attending
      };
    } else {
      updatedParticipations.push({ 
        userId, 
        attendeeName: !userId ? name : undefined, 
        eventId, 
        attending 
      });
    }
    
    persistParticipations(updatedParticipations);
    
    toast({
      title: attending ? "RSVP Confirmed!" : "RSVP Cancelled",
      description: attending 
        ? `${name} has been added to the event attendees.` 
        : `${name} has been removed from the event attendees.`
    });
  };

  const updateRankings = (userId: string, eventId: string, rankings: Record<string, number>) => {
    console.log("[RANKINGS] Starting update with:", { userId, eventId, rankings });
    
    // Find the participant index
    const participantIndex = participations.findIndex(
      p => p.eventId === eventId && 
           (p.userId === userId || (!p.userId && p.attendeeName === userId))
    );
    
    if (participantIndex === -1) {
      console.error("[RANKINGS] No participation found for:", userId, "in event:", eventId);
      console.log("[RANKINGS] All participations:", JSON.stringify(participations));
      
      // Create new participation if none exists
      const newParticipation: Participation = {
        eventId,
        attending: true,
        rankings: { ...rankings }
      };
      
      // Add userId or attendeeName based on what was provided
      if (userId.match(/^[0-9]+$/)) {
        newParticipation.userId = userId;
      } else {
        newParticipation.attendeeName = userId;
      }
      
      const updatedParticipations = [...participations, newParticipation];
      
      persistParticipations(updatedParticipations);
      
      toast({
        title: "Preferences Saved",
        description: "Your game rankings have been saved successfully."
      });
      
      return;
    }
    
    console.log("[RANKINGS] Found participant at index:", participantIndex);
    console.log("[RANKINGS] Current participation:", participations[participantIndex]);
    
    // Create a completely new array with the updated participation
    const updatedParticipations = [...participations];
    
    // Create a new participation object with the updated rankings
    updatedParticipations[participantIndex] = {
      ...updatedParticipations[participantIndex],
      rankings: { ...rankings } // Create a new rankings object
    };
    
    console.log("[RANKINGS] New participation object:", updatedParticipations[participantIndex]);
    
    // Persist the updated participations
    persistParticipations(updatedParticipations);
    
    toast({
      title: "Preferences Saved",
      description: "Your game rankings have been updated successfully."
    });
  };

  const updateExcluded = (userId: string, eventId: string, excluded: string[]) => {
    console.log("[EXCLUSIONS] Starting update with:", { userId, eventId, excluded });
    
    // Find the participant index
    const participantIndex = participations.findIndex(
      p => p.eventId === eventId && 
           (p.userId === userId || (!p.userId && p.attendeeName === userId))
    );
    
    if (participantIndex === -1) {
      console.error("[EXCLUSIONS] No participation found for:", userId, "in event:", eventId);
      console.log("[EXCLUSIONS] All participations:", JSON.stringify(participations));
      
      // Create new participation if none exists
      const newParticipation: Participation = {
        eventId,
        attending: true,
        excluded: [...excluded]
      };
      
      // Add userId or attendeeName based on what was provided
      if (userId.match(/^[0-9]+$/)) {
        newParticipation.userId = userId;
      } else {
        newParticipation.attendeeName = userId;
      }
      
      const updatedParticipations = [...participations, newParticipation];
      
      persistParticipations(updatedParticipations);
      
      toast({
        title: "Exclusions Saved",
        description: "Your game exclusions have been saved successfully."
      });
      
      return;
    }
    
    console.log("[EXCLUSIONS] Found participant at index:", participantIndex);
    console.log("[EXCLUSIONS] Current participation:", participations[participantIndex]);
    
    // Create a completely new array with the updated participation
    const updatedParticipations = [...participations];
    
    // Create a new participation object with the updated exclusions
    updatedParticipations[participantIndex] = {
      ...updatedParticipations[participantIndex],
      excluded: [...excluded] // Create a new excluded array
    };
    
    console.log("[EXCLUSIONS] New participation object:", updatedParticipations[participantIndex]);
    
    // Persist the updated participations
    persistParticipations(updatedParticipations);
    
    toast({
      title: "Exclusions Saved",
      description: "Your game exclusions have been updated successfully."
    });
  };

  return { setParticipation, setAttendanceByName, updateRankings, updateExcluded };
};
