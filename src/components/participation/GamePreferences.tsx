
import { useState, useEffect } from 'react';
import { Boardgame } from '@/types';
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
  const { currentUser, participations, updateRankings, updateExcluded, setAttendanceByName } = useApp();
  
  // Get user's participation data
  const userParticipation = currentUser 
    ? participations.find(p => p.userId === currentUser.id && p.eventId === eventId)
    : participations.find(p => p.eventId === eventId && p.attending && !p.userId);
  
  // Initialize game list state
  const [gameList, setGameList] = useState<Boardgame[]>([]);
  
  // Initialize excluded games
  const [excluded, setExcluded] = useState<string[]>([]);
  
  // Initialize state from participation
  useEffect(() => {
    if (userParticipation) {
      setExcluded(userParticipation.excluded || []);
      
      // Create a ranked list of games
      if (userParticipation.rankings) {
        const sortedGames = [...eventBoardgames].sort((a, b) => {
          const rankA = userParticipation.rankings?.[a.id] || 999;
          const rankB = userParticipation.rankings?.[b.id] || 999;
          return rankA - rankB;
        });
        
        // Filter out excluded games
        const filteredGames = sortedGames.filter(game => 
          !userParticipation.excluded?.includes(game.id)
        );
        
        setGameList(filteredGames);
      } else {
        // If no rankings exist yet, show all non-excluded games
        setGameList(
          eventBoardgames.filter(game => !userParticipation.excluded?.includes(game.id))
        );
      }
    } else {
      // Default to all games if no participation data
      setGameList([...eventBoardgames]);
      setExcluded([]);
    }
  }, [userParticipation, eventBoardgames]);
  
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
      // Remove from excluded
      setExcluded(excluded.filter(id => id !== gameId));
      
      // Add back to the list at the end
      const gameToAdd = eventBoardgames.find(g => g.id === gameId);
      if (gameToAdd) {
        setGameList([...gameList, gameToAdd]);
      }
    } else {
      // Add to excluded
      setExcluded([...excluded, gameId]);
      
      // Remove from the list
      setGameList(gameList.filter(game => game.id !== gameId));
    }
  };
  
  const savePreferences = () => {
    // Convert ordered list to rankings
    const rankings: Record<string, number> = {};
    gameList.forEach((game, index) => {
      rankings[game.id] = index + 1;
    });
    
    if (currentUser) {
      // Save preferences for logged-in user
      updateRankings(currentUser.id, eventId, rankings);
      updateExcluded(currentUser.id, eventId, excluded);
    } else if (userParticipation?.attendeeName) {
      // Save preferences for guest user
      // First, ensure attendance is set (in case it's a new session)
      setAttendanceByName(
        userParticipation.attendeeName, 
        eventId, 
        true
      );
      
      // Then update the rankings and exclusions
      // We need to pass undefined as userId to ensure it updates the correct participation
      setAttendanceByName(
        userParticipation.attendeeName,
        eventId,
        true,
        undefined
      );
      
      // Use the updateRankings and updateExcluded functions directly
      const participationId = userParticipation.attendeeName;
      updateRankings(participationId, eventId, rankings);
      updateExcluded(participationId, eventId, excluded);
    }
  };
  
  // Get complexity class - helper function
  const getComplexityClass = (rating: number) => {
    if (rating <= 1.5) return 'complexity-light';
    if (rating <= 2.5) return 'complexity-medium-light';
    if (rating <= 3.5) return 'complexity-medium';
    if (rating <= 4.5) return 'complexity-medium-heavy';
    return 'complexity-heavy';
  };
  
  // Helper function to format complexity
  const formatComplexity = (rating: number) => {
    return rating.toFixed(1);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Preferences</CardTitle>
        <CardDescription>
          Drag and drop to rank games, or exclude ones you don't want to play
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
                      <Badge className={getComplexityClass(game.complexityRating)}>
                        {formatComplexity(game.complexityRating)}
                      </Badge>
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
        <Button onClick={savePreferences} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
};
