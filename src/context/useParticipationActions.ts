
import { Dispatch, SetStateAction } from 'react';
import { Participation } from '@/types';
import { ToastType } from '@/hooks/use-toast';
import * as supabaseService from '@/services/supabaseService';

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
  const setParticipation = async (userId: string, eventId: string, attending: boolean) => {
    try {
      const participation: Participation = {
        userId,
        eventId,
        attending
      };
      
      await supabaseService.createOrUpdateParticipation(participation);
      
      // Lokalen State aktualisieren für sofortige UI-Aktualisierung
      // (Supabase-Subscription wird den State später synchronisieren)
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
        updatedParticipations.push(participation);
      }
      
      setParticipations(updatedParticipations);
      
      toast({
        title: attending ? "You're Going!" : "RSVP Updated",
        description: attending 
          ? "You've been added to the event attendees." 
          : "You've been removed from the event attendees."
      });
    } catch (error) {
      console.error('Error updating participation:', error);
      toast({
        title: "Error",
        description: "Failed to update your RSVP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const setAttendanceByName = async (name: string, eventId: string, attending: boolean, userId?: string) => {
    try {
      const participation: Participation = {
        userId,
        attendeeName: !userId ? name : undefined,
        eventId,
        attending
      };
      
      await supabaseService.createOrUpdateParticipation(participation);
      
      // Lokalen State aktualisieren für sofortige UI-Aktualisierung
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
        updatedParticipations.push(participation);
      }
      
      setParticipations(updatedParticipations);
      
      toast({
        title: attending ? "RSVP Confirmed!" : "RSVP Cancelled",
        description: attending 
          ? `${name} has been added to the event attendees.` 
          : `${name} has been removed from the event attendees.`
      });
    } catch (error) {
      console.error('Error updating attendance by name:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateRankings = async (userId: string, eventId: string, rankings: Record<string, number>) => {
    try {
      console.log("[RANKINGS] Starting update with:", { userId, eventId, rankings });
      
      // Prüfen, ob userId eine numerische ID oder ein Gästename ist
      const isUserId = userId.match(/^[0-9]+$/);
      
      if (isUserId) {
        await supabaseService.updateParticipationRankings(userId, undefined, eventId, rankings);
      } else {
        await supabaseService.updateParticipationRankings(undefined, userId, eventId, rankings);
      }
      
      // Lokalen State aktualisieren für sofortige UI-Aktualisierung
      const participantIndex = participations.findIndex(
        p => p.eventId === eventId && 
             (
               (isUserId && p.userId === userId) || 
               (!isUserId && p.attendeeName === userId)
             )
      );
      
      if (participantIndex === -1) {
        console.log("[RANKINGS] Creating new participation with rankings");
        
        const newParticipation: Participation = {
          eventId,
          attending: true,
          rankings: { ...rankings }
        };
        
        // Add userId or attendeeName based on what was provided
        if (isUserId) {
          newParticipation.userId = userId;
        } else {
          newParticipation.attendeeName = userId;
        }
        
        setParticipations(prev => [...prev, newParticipation]);
      } else {
        console.log("[RANKINGS] Updating existing participation with rankings");
        
        setParticipations(prev => {
          const updated = [...prev];
          updated[participantIndex] = {
            ...updated[participantIndex],
            rankings: { ...rankings }
          };
          return updated;
        });
      }
      
      toast({
        title: "Preferences Saved",
        description: "Your game rankings have been updated successfully."
      });
    } catch (error) {
      console.error('Error updating rankings:', error);
      toast({
        title: "Error",
        description: "Failed to update game rankings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateExcluded = async (userId: string, eventId: string, excluded: string[]) => {
    try {
      console.log("[EXCLUSIONS] Starting update with:", { userId, eventId, excluded });
      
      // Prüfen, ob userId eine numerische ID oder ein Gästename ist
      const isUserId = userId.match(/^[0-9]+$/);
      
      if (isUserId) {
        await supabaseService.updateParticipationExcluded(userId, undefined, eventId, excluded);
      } else {
        await supabaseService.updateParticipationExcluded(undefined, userId, eventId, excluded);
      }
      
      // Lokalen State aktualisieren für sofortige UI-Aktualisierung
      const participantIndex = participations.findIndex(
        p => p.eventId === eventId && 
             (
               (isUserId && p.userId === userId) || 
               (!isUserId && p.attendeeName === userId)
             )
      );
      
      if (participantIndex === -1) {
        console.log("[EXCLUSIONS] Creating new participation with exclusions");
        
        const newParticipation: Participation = {
          eventId,
          attending: true,
          excluded: [...excluded]
        };
        
        // Add userId or attendeeName based on what was provided
        if (isUserId) {
          newParticipation.userId = userId;
        } else {
          newParticipation.attendeeName = userId;
        }
        
        setParticipations(prev => [...prev, newParticipation]);
      } else {
        console.log("[EXCLUSIONS] Updating existing participation with exclusions");
        
        setParticipations(prev => {
          const updated = [...prev];
          updated[participantIndex] = {
            ...updated[participantIndex],
            excluded: [...excluded]
          };
          return updated;
        });
      }
      
      toast({
        title: "Exclusions Saved",
        description: "Your game exclusions have been updated successfully."
      });
    } catch (error) {
      console.error('Error updating exclusions:', error);
      toast({
        title: "Error",
        description: "Failed to update game exclusions. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { setParticipation, setAttendanceByName, updateRankings, updateExcluded };
};
