
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { BoardgameCard } from '@/components/boardgame/BoardgameCard';
import { BoardgameForm } from '@/components/boardgame/BoardgameForm';
import { EventCard } from '@/components/event/EventCard';
import { EventForm } from '@/components/event/EventForm';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Gamepad, Calendar, Edit, Trash, Plus, ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { boardgames, events, deleteBoardgame, deleteEvent, currentUser } = useApp();
  const [addingBoardgame, setAddingBoardgame] = useState(false);
  const [editingBoardgame, setEditingBoardgame] = useState<string | null>(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);

  // Redirect non-admin users
  if (!currentUser?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage boardgames and events</p>
        </div>
        
        <Tabs defaultValue="events">
          <TabsList className="mb-6">
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="boardgames" className="flex items-center">
              <Gamepad className="h-4 w-4 mr-2" />
              Boardgames
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle>Manage Events</CardTitle>
                    <CardDescription>Create, edit, or delete game night events</CardDescription>
                  </div>
                  <Button onClick={() => setAddingEvent(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addingEvent && (
                  <div className="mb-8">
                    <EventForm 
                      onSave={() => setAddingEvent(false)}
                      onCancel={() => setAddingEvent(false)}
                    />
                  </div>
                )}
                
                {editingEvent && (
                  <div className="mb-8">
                    <EventForm 
                      event={events.find(e => e.id === editingEvent)!}
                      onSave={() => setEditingEvent(null)}
                      onCancel={() => setEditingEvent(null)}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground mb-4">No events created yet</p>
                      <Button onClick={() => setAddingEvent(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Button>
                    </div>
                  ) : (
                    events.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event}
                        actions={
                          <div className="w-full flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setEditingEvent(event.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex-1">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the event "{event.title}" and all associated attendance records.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteEvent(event.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        }
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="boardgames">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle>Manage Boardgames</CardTitle>
                    <CardDescription>Add, edit, or remove boardgames from your collection</CardDescription>
                  </div>
                  <Button onClick={() => setAddingBoardgame(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Boardgame
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {addingBoardgame && (
                  <div className="mb-8">
                    <BoardgameForm 
                      onSave={() => setAddingBoardgame(false)}
                      onCancel={() => setAddingBoardgame(false)}
                    />
                  </div>
                )}
                
                {editingBoardgame && (
                  <div className="mb-8">
                    <BoardgameForm 
                      boardgame={boardgames.find(bg => bg.id === editingBoardgame)!}
                      onSave={() => setEditingBoardgame(null)}
                      onCancel={() => setEditingBoardgame(null)}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boardgames.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground mb-4">No boardgames added yet</p>
                      <Button onClick={() => setAddingBoardgame(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Boardgame
                      </Button>
                    </div>
                  ) : (
                    boardgames.map(boardgame => (
                      <BoardgameCard 
                        key={boardgame.id} 
                        boardgame={boardgame}
                        actions={
                          <div className="w-full flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setEditingBoardgame(boardgame.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex-1">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the boardgame "{boardgame.title}" from your collection.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteBoardgame(boardgame.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        }
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
