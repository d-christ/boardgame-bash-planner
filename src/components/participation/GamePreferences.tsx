import { useState, useEffect, useCallback } from 'react';
import { Boardgame, Participation } from '@/types';
import { useApp } from '@/context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, GripVertical, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GamePreferencesProps {
  eventId: string;
  eventBoardgames: Boardgame[];
}

export const GamePreferences = ({ eventId, eventBoardgames }: GamePreferencesProps) => {
  const { currentUser, participations, updateRankings, updateExcluded } = useApp();
  
  const participantId = currentUser ? currentUser.id : 
    (participations.find(p => p.eventId === eventId && p.attending && !p.userId)?.attendeeName || '');
  
  const [gameList, setGameList] = useState<Array<Boardgame & { rank: number }>>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  console.log("[GAME_PREFS] Rendering with participantId:", participantId);
  
  const userParticipation = participations.find(p => 
    p.eventId === eventId && 
    ((currentUser && p.userId === currentUser.id) || 
     (!currentUser && p.attendeeName === participantId))
  );
  
  console.log("[GAME_PREFS] Found participation:", userParticipation);
  console.log("[GAME_PREFS] Current participations in localStorage:",
    JSON.parse(localStorage.getItem('participations') || '[]'));
  
  const initializeGamePreferences = useCallback(() => {
    if (!participantId) {
      console.log("[GAME_PREFS] No participant ID found, skipping initialization");
      return;
    }
    
    console.log("[GAME_PREFS] Initializing game preferences");
    
    const storedParticipations = JSON.parse(localStorage.getItem('participations') || '[]');
    const storedParticipation = storedParticipations.find((p: any) => 
      p.eventId === eventId && 
      ((currentUser && p.userId === currentUser.id) || 
       (!currentUser && p.attendeeName === participantId))
    );
    
    const participation = storedParticipation || userParticipation;
    
    console.log("[GAME_PREFS] Using participation:", participation);
    
    const excludedGames = participation?.excluded || [];
    console.log("[GAME_PREFS] Excluded games:", excludedGames);
    setExcluded(excludedGames);
    
    const savedRankings = participation?.rankings || {};
    console.log("[GAME_PREFS] Saved rankings:", savedRankings);
    
    const includedGames = eventBoardgames.filter(game => 
      !excludedGames.includes(game.id)
    );
    
    const rankedGames = includedGames.map(game => ({
      ...game,
      rank: savedRankings[game.id] || 0
    }));
    
    const sortedGames = [...rankedGames].sort((a, b) => {
      if (a.rank > 0 && b.rank > 0) {
        return a.rank - b.rank;
      }
      if (a.rank > 0) return -1;
      if (b.rank > 0) return 1;
      return 0;
    });
    
    console.log("[GAME_PREFS] Setting game list:", sortedGames);
    setGameList(sortedGames);
    setInitialized(true);
  }, [participantId, eventId, eventBoardgames, userParticipation, currentUser]);
  
  useEffect(() => {
    if (!isSaving) {
      initializeGamePreferences();
    }
  }, [initializeGamePreferences, participations, isSaving]);
  
  const moveGameUp = (index: number) => {
    if (index <= 0) return;
    
    const newList = [...gameList];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setGameList(newList);
  };
  
  const moveGameDown = (index: number) => {
    if (index >= gameList.length - 1) return;
    
    const newList = [...gameList];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    setGameList(newList);
  };
  
  const toggleExcluded = (gameId: string) => {
    if (excluded.includes(gameId)) {
      setExcluded(excluded.filter(id => id !== gameId));
      
      const gameToAdd = eventBoardgames.find(g => g.id === gameId);
      if (gameToAdd) {
        setGameList([...gameList, { ...gameToAdd, rank: 0 }]);
      }
    } else {
      setExcluded([...excluded, gameId]);
      
      setGameList(gameList.filter(game => game.id !== gameId));
    }
  };
  
  const savePreferences = async () => {
    if (!participantId || !initialized) {
      console.error("[GAME_PREFS] Cannot save: No participant ID found or not initialized");
      return;
    }
    
    setIsSaving(true);
    console.log("[GAME_PREFS] Saving preferences for:", participantId);
    
    const rankings: Record<string, number> = {};
    
    gameList.forEach((game, index) => {
      rankings[game.id] = index + 1;
    });
    
    console.log("[GAME_PREFS] Rankings to save:", rankings);
    console.log("[GAME_PREFS] Exclusions to save:", excluded);
    
    try {
      updateRankings(participantId, eventId, rankings);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateExcluded(participantId, eventId, excluded);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("[GAME_PREFS] Saved successfully, refreshing from localStorage");
      
      const storedData = localStorage.getItem('participations');
      console.log("[GAME_PREFS] Current localStorage state:", storedData);
      
      if (storedData) {
        const storedParticipations = JSON.parse(storedData);
        const participationIndex = storedParticipations.findIndex((p: Participation) => 
          p.eventId === eventId && 
          ((currentUser && p.userId === currentUser.id) || 
          (!currentUser && p.attendeeName === participantId))
        );
  
        if (participationIndex !== -1) {
          storedParticipations[participationIndex].rankings = rankings;
          
          localStorage.setItem('participations', JSON.stringify(storedParticipations));
          console.log("[GAME_PREFS] Explicitly updated localStorage with new rankings");
        }
      }
      
    } catch (error) {
      console.error("[GAME_PREFS] Error saving preferences:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 100);
    }
  };
  
  const getComplexityClass = (rating: number | undefined) => {
    if (!rating) return 'complexity-light';
    if (rating <= 1.5) return 'complexity-light';
    if (rating <= 2.5) return 'complexity-medium-light';
    if (rating <= 3.5) return 'complexity-medium';
    if (rating <= 4.5) return 'complexity-medium-heavy';
    return 'complexity-heavy';
  };
  
  const formatComplexity = (rating: number | undefined) => {
    return rating?.toFixed(1) || 'N/A';
  };
  
  if (!participantId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Preferences</CardTitle>
          <CardDescription>
            You need to RSVP to this event to set game preferences.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Preferences</CardTitle>
        <CardDescription>
          Arrange games in order of preference (top = most preferred)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Your Game Ranking</h3>
            {gameList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                You haven't selected any games. Move games from the excluded list below.
              </p>
            ) : (
              <div className="space-y-2 border rounded-md p-2">
                {gameList.map((game, index) => (
                  <div 
                    key={game.id}
                    className="bg-card border rounded-md p-3 flex items-center gap-2"
                  >
                    <div className="flex-shrink-0">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{game.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getComplexityClass(game.complexityRating)}>
                          {formatComplexity(game.complexityRating)}
                        </Badge>
                        <Badge variant="outline">
                          Rank: {index + 1}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => moveGameUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => moveGameDown(index)}
                        disabled={index === gameList.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExcluded(game.id)}
                        className="text-xs ml-2"
                      >
                        Exclude
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Excluded Games</h3>
            {excluded.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No games excluded.
              </p>
            ) : (
              <div className="space-y-2 border rounded-md p-2 border-destructive/30 bg-destructive/5">
                {eventBoardgames
                  .filter(game => excluded.includes(game.id))
                  .map((game) => (
                    <div 
                      key={game.id}
                      className="bg-card border rounded-md p-3 flex items-center gap-2"
                    >
                      <div className="flex-grow">
                        <h4 className="font-medium">{game.title}</h4>
                        <Badge className={getComplexityClass(game.complexityRating)}>
                          {formatComplexity(game.complexityRating)}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExcluded(game.id)}
                        className="text-xs"
                      >
                        Include
                      </Button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={savePreferences} 
          className="w-full"
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
};
