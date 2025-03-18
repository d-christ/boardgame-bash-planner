
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { BoardgameCard } from '@/components/boardgame/BoardgameCard';
import { GamePreferences } from '@/components/participation/GamePreferences';
import { AttendanceForm } from '@/components/participation/AttendanceForm';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, boardgames, currentUser, participations } = useApp();
  
  // Find the event
  const event = events.find(e => e.id === id);
  
  // If event not found, redirect to home
  if (!event) {
    navigate('/');
    return null;
  }
  
  // Get boardgames for this event
  const eventBoardgames = boardgames.filter(bg => 
    event.boardgames.includes(bg.id)
  );
  
  // Calculate count of attendees for this event
  const attendees = participations.filter(
    p => p.eventId === event.id && p.attending
  );
  
  // Check if current user is attending
  const userParticipation = currentUser 
    ? participations.find(
        p => p.userId === currentUser.id && p.eventId === event.id
      )
    : null;
  
  const isAttending = userParticipation?.attending || false;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{event.description}</CardDescription>
                  </div>
                  
                  <Badge variant="outline" className="flex items-center text-base">
                    <Users className="h-4 w-4 mr-2" />
                    {attendees.length} attendees
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="text-lg">{format(new Date(event.date), 'PPP')}</span>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Available Games</h2>
                  {eventBoardgames.length === 0 ? (
                    <p className="text-muted-foreground">No games selected for this event.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventBoardgames.map(game => (
                        <BoardgameCard key={game.id} boardgame={game} />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <AttendanceForm eventId={event.id} />
            
            {isAttending && (
              <div className="mt-6">
                <GamePreferences eventId={event.id} eventBoardgames={eventBoardgames} />
              </div>
            )}
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Attendees ({attendees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {attendees.length === 0 ? (
                  <p className="text-muted-foreground">No one has signed up yet. Be the first!</p>
                ) : (
                  <ul className="space-y-2">
                    {attendees.map((attendee, index) => {
                      const user = attendee.userId ? 
                        useApp().users.find(u => u.id === attendee.userId) : null;
                      
                      return (
                        <li key={attendee.userId || index} className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-green-500" />
                          {user?.name || attendee.attendeeName || 'Unknown Attendee'}
                          {user?.isAdmin && (
                            <Badge variant="outline" className="ml-2">Admin</Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
