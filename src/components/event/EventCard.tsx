
import { useState } from 'react';
import { Event, Boardgame } from '@/types';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { BoardgameCard } from '@/components/boardgame/BoardgameCard';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  detailed?: boolean;
  actions?: React.ReactNode;
}

export const EventCard = ({ event, detailed = false, actions }: EventCardProps) => {
  const { boardgames, currentUser, participations } = useApp();
  const [showGames, setShowGames] = useState(false);
  
  // Get boardgames for this event
  const eventBoardgames = boardgames.filter(bg => 
    event.boardgames.includes(bg.id)
  );
  
  // Calculate count of attendees for this event
  const attendeesCount = participations.filter(
    p => p.eventId === event.id && p.attending
  ).length;
  
  // Check if current user is attending
  const userParticipation = currentUser 
    ? participations.find(
        p => p.userId === currentUser.id && p.eventId === event.id
      )
    : null;
  
  const isAttending = userParticipation?.attending || false;
  
  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          {event.maxAttendees && (
            <Badge variant="outline" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {attendeesCount} / {event.maxAttendees}
            </Badge>
          )}
        </div>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(event.date), 'PPP')}</span>
          </div>
          
          {isAttending && (
            <Badge className="bg-green-500">You're attending</Badge>
          )}
          
          {(detailed || showGames) && eventBoardgames.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Games included:</h3>
              <div className="grid grid-cols-1 gap-2">
                {eventBoardgames.map(game => (
                  <BoardgameCard 
                    key={game.id}
                    boardgame={game}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
          
          {!detailed && eventBoardgames.length > 0 && (
            <Button 
              variant="ghost" 
              className="w-full mt-2 flex items-center justify-center"
              onClick={() => setShowGames(!showGames)}
            >
              {showGames ? (
                <>Hide Games <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Show Games ({eventBoardgames.length}) <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </CardContent>
      
      {actions && (
        <CardFooter>
          {actions}
        </CardFooter>
      )}
    </Card>
  );
};
