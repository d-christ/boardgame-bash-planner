
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event/EventCard';
import { Navigation } from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { Calendar, Check, X } from 'lucide-react';

const Index = () => {
  const { events, currentUser, setParticipation } = useApp();
  
  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Upcoming Game Events</h1>
            <p className="text-muted-foreground">Find a game night to join and play your favorite boardgames</p>
          </div>
          
          {currentUser?.isAdmin && (
            <Link to="/admin">
              <Button className="mt-4 md:mt-0">
                <Calendar className="mr-2 h-5 w-5" />
                Manage Events
              </Button>
            </Link>
          )}
        </div>
        
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No events scheduled</h2>
            <p className="text-muted-foreground mb-6">Check back later for upcoming game nights</p>
            {currentUser?.isAdmin && (
              <Link to="/admin">
                <Button>
                  <Calendar className="mr-2 h-5 w-5" />
                  Create an Event
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map(event => {
              // Check if user is attending
              const userParticipation = currentUser 
                ? events.find(
                    e => e.id === event.id && 
                    currentUser && 
                    setParticipation
                  )
                : null;
              
              return (
                <EventCard 
                  key={event.id} 
                  event={event}
                  actions={
                    <div className="w-full">
                      <Link to={`/event/${event.id}`}>
                        <Button variant="secondary" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      
                      {currentUser && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setParticipation(currentUser.id, event.id, false)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Skip
                          </Button>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => setParticipation(currentUser.id, event.id, true)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            I'm In!
                          </Button>
                        </div>
                      )}
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
