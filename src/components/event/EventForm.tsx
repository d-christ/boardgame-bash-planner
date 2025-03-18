
import { useState, useEffect } from 'react';
import { useApp } from '@/context';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BoardgameCard } from '@/components/boardgame/BoardgameCard';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface EventFormProps {
  event?: Event;
  onSave: () => void;
  onCancel: () => void;
}

export const EventForm = ({ event, onSave, onCancel }: EventFormProps) => {
  const { addEvent, updateEvent, boardgames } = useApp();
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState<Date>(event?.date ? new Date(event.date) : new Date());
  const [selectedBoardgames, setSelectedBoardgames] = useState<string[]>(event?.boardgames || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      title,
      description,
      date,
      boardgames: selectedBoardgames
    };
    
    if (event) {
      updateEvent(event.id, eventData);
    } else {
      addEvent(eventData);
    }
    
    onSave();
  };

  const toggleBoardgame = (boardgameId: string) => {
    setSelectedBoardgames(prev =>
      prev.includes(boardgameId)
        ? prev.filter(id => id !== boardgameId)
        : [...prev, boardgameId]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{event ? 'Edit' : 'Add'} Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Select Boardgames</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {boardgames.map(game => (
                <div 
                  key={game.id} 
                  className={`border rounded-md cursor-pointer transition-colors hover:bg-secondary/10 ${
                    selectedBoardgames.includes(game.id) ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => toggleBoardgame(game.id)}
                >
                  <div className="p-3 flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Checkbox 
                        checked={selectedBoardgames.includes(game.id)}
                        className="pointer-events-none"
                        disabled={true}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{game.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{game.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {boardgames.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No boardgames available. Add some boardgames first.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
