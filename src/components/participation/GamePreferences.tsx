
import { useState, useEffect } from 'react';
import { Boardgame } from '@/types';
import { useApp } from '@/context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, GripVertical, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface GamePreferencesProps {
  eventId: string;
  eventBoardgames: Boardgame[];
}

export const GamePreferences = ({ eventId, eventBoardgames }: GamePreferencesProps) => {
  const { currentUser, participations, updateRankings, updateExcluded } = useApp();
  
  // Get user's participation data
  const userId = currentUser ? currentUser.id : undefined;
  const guestName = !currentUser ? participations.find(p => p.eventId === eventId && p.attending && !p.userId)?.attendeeName : undefined;
  
  // Find the correct participation record
  const userParticipation = userId 
    ? participations.find(p => p.userId === userId && p.eventId === eventId)
    : guestName 
      ? participations.find(p => p.attendeeName === guestName && p.eventId === eventId) 
      : undefined;
  
  // Initialize state
  const [gameList, setGameList] = useState<Array<Boardgame & { rank?: number }>>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  
  // Helper to get actual participantId (userId or guestName)
  const getParticipantId = () => {
    return userId || guestName || '';
  };
  
  // Initialize state from participation
  useEffect(() => {
    if (!userParticipation) {
      // If no participation, show all games unranked
      setGameList(eventBoardgames.map(game => ({ ...game })));
      setExcluded([]);
      return;
    }
    
    console.log("Loading user participation:", userParticipation);
    
    // Set excluded games
    setExcluded(userParticipation.excluded || []);
    
    // Filter out excluded games
    const includedGames = eventBoardgames.filter(
      game => !userParticipation.excluded?.includes(game.id)
    );
    
    // Map games with their rankings
    const mappedGames = includedGames.map(game => ({
      ...game,
      rank: userParticipation.rankings?.[game.id]
    }));
    
    // Sort by rank (if available)
    const sortedGames = [...mappedGames].sort((a, b) => {
      // If both have ranks, sort by rank
      if (a.rank && b.rank) return a.rank - b.rank;
      // If only a has rank, a comes first
      if (a.rank) return -1;
      // If only b has rank, b comes first
      if (b.rank) return 1;
      // If neither has rank, maintain original order
      return 0;
    });
    
    setGameList(sortedGames);
    
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
    const participantId = getParticipantId();
    
    if (!participantId) {
      console.error("Cannot save preferences: No user ID or guest name found");
      return;
    }
    
    // Convert ordered list to rankings
    const rankings: Record<string, number> = {};
    
    // Assign ranks based on current order (1-based)
    gameList.forEach((game, index) => {
      rankings[game.id] = index + 1;
    });
    
    console.log("Saving rankings for:", participantId, "Event ID:", eventId, "Rankings:", rankings);
    
    // Update rankings
    updateRankings(participantId, eventId, rankings);
    
    // Update exclusions
    updateExcluded(participantId, eventId, excluded);
  };
  
  // Get complexity class
  const getComplexityClass = (rating: number | undefined) => {
    if (!rating) return 'complexity-light';
    if (rating <= 1.5) return 'complexity-light';
    if (rating <= 2.5) return 'complexity-medium-light';
    if (rating <= 3.5) return 'complexity-medium';
    if (rating <= 4.5) return 'complexity-medium-heavy';
    return 'complexity-heavy';
  };
  
  // Format complexity
  const formatComplexity = (rating: number | undefined) => {
    return rating?.toFixed(1) || 'N/A';
  };
  
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
        <Button onClick={savePreferences} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
};
