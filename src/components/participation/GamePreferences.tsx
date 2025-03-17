
import { useState, useEffect } from 'react';
import { Boardgame } from '@/types';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, X, Check, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GamePreferencesProps {
  eventId: string;
  eventBoardgames: Boardgame[];
}

export const GamePreferences = ({ eventId, eventBoardgames }: GamePreferencesProps) => {
  const { currentUser, participations, updateRankings, updateExcluded } = useApp();
  
  // Get current user's participation
  const userParticipation = currentUser 
    ? participations.find(
        p => p.userId === currentUser.id && p.eventId === eventId
      )
    : null;
  
  // Initialize rankings state
  const [rankings, setRankings] = useState<Record<string, number>>({});
  
  // Initialize excluded games
  const [excluded, setExcluded] = useState<string[]>([]);
  
  // Initialize state from participation
  useEffect(() => {
    if (userParticipation) {
      setRankings(userParticipation.rankings || {});
      setExcluded(userParticipation.excluded || []);
    }
  }, [userParticipation]);
  
  // Calculate display order based on rankings
  const sortedGames = [...eventBoardgames].sort((a, b) => {
    const rankA = rankings[a.id] || 999;
    const rankB = rankings[b.id] || 999;
    return rankA - rankB;
  });
  
  const moveGameUp = (gameId: string) => {
    const currentRank = rankings[gameId] || 999;
    const newRankings = { ...rankings };
    
    // Find the game that has the rank above this one
    const gameAbove = Object.entries(rankings).find(
      ([id, rank]) => rank === currentRank - 1
    );
    
    if (gameAbove) {
      // Swap ranks
      newRankings[gameId] = currentRank - 1;
      newRankings[gameAbove[0]] = currentRank;
    } else {
      // This game is already at the top, so set it to 1
      newRankings[gameId] = Math.min(...Object.values(newRankings), currentRank, 1);
    }
    
    setRankings(newRankings);
  };
  
  const moveGameDown = (gameId: string) => {
    const currentRank = rankings[gameId] || 999;
    const newRankings = { ...rankings };
    
    // Find the game that has the rank below this one
    const gameBelow = Object.entries(rankings).find(
      ([id, rank]) => rank === currentRank + 1
    );
    
    if (gameBelow) {
      // Swap ranks
      newRankings[gameId] = currentRank + 1;
      newRankings[gameBelow[0]] = currentRank;
    } else {
      // Find the highest rank and add 1
      const highestRank = Object.values(newRankings).length > 0 
        ? Math.max(...Object.values(newRankings))
        : 0;
      newRankings[gameId] = highestRank + 1;
    }
    
    setRankings(newRankings);
  };
  
  const toggleExcluded = (gameId: string) => {
    if (excluded.includes(gameId)) {
      setExcluded(excluded.filter(id => id !== gameId));
      
      // If we're un-excluding it, give it the lowest rank
      const highestRank = Object.values(rankings).length > 0 
        ? Math.max(...Object.values(rankings))
        : 0;
      setRankings({
        ...rankings,
        [gameId]: highestRank + 1
      });
    } else {
      setExcluded([...excluded, gameId]);
      
      // Remove from rankings if excluded
      const newRankings = { ...rankings };
      delete newRankings[gameId];
      setRankings(newRankings);
    }
  };
  
  const savePreferences = () => {
    if (currentUser) {
      // Remove any excluded games from rankings
      const filteredRankings = { ...rankings };
      excluded.forEach(gameId => {
        delete filteredRankings[gameId];
      });
      
      updateRankings(currentUser.id, eventId, filteredRankings);
      updateExcluded(currentUser.id, eventId, excluded);
    }
  };
  
  if (!currentUser || !userParticipation || !userParticipation.attending) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Preferences</CardTitle>
        <CardDescription>
          Rank the games you'd like to play and exclude any you don't want to play
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {eventBoardgames.length === 0 ? (
            <p className="text-sm text-muted-foreground">No games available for this event</p>
          ) : (
            sortedGames.map((game) => {
              const isExcluded = excluded.includes(game.id);
              const rank = rankings[game.id];
              
              return (
                <div 
                  key={game.id}
                  className={`p-3 border rounded-md ${
                    isExcluded ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => moveGameUp(game.id)}
                          disabled={isExcluded}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        {rank && !isExcluded && (
                          <Badge variant="outline">{rank}</Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => moveGameDown(game.id)}
                          disabled={isExcluded}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-medium">{game.title}</h3>
                        <Badge 
                          className={`mt-1 difficulty-${game.difficulty}`}
                        >
                          {game.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`exclude-${game.id}`}
                          checked={isExcluded}
                          onCheckedChange={() => toggleExcluded(game.id)}
                        />
                        <Label 
                          htmlFor={`exclude-${game.id}`}
                          className="text-sm cursor-pointer"
                        >
                          Don't play
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
