
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Boardgame, Difficulty } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';

interface BoardgameFormProps {
  boardgame?: Boardgame;
  onSave: () => void;
  onCancel: () => void;
}

export const BoardgameForm = ({ boardgame, onSave, onCancel }: BoardgameFormProps) => {
  const { addBoardgame, updateBoardgame } = useApp();
  const [title, setTitle] = useState(boardgame?.title || '');
  const [description, setDescription] = useState(boardgame?.description || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(boardgame?.difficulty || 'medium');
  const [videoUrl, setVideoUrl] = useState(boardgame?.videoUrl || '');
  const [bggUrl, setBggUrl] = useState(boardgame?.bggUrl || '');
  const [imageUrl, setImageUrl] = useState(boardgame?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const boardgameData = {
      title,
      description,
      difficulty,
      videoUrl: videoUrl || undefined,
      bggUrl: bggUrl || undefined,
      imageUrl: imageUrl || undefined
    };
    
    if (boardgame) {
      updateBoardgame(boardgame.id, boardgameData);
    } else {
      addBoardgame(boardgameData);
    }
    
    onSave();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{boardgame ? 'Edit' : 'Add'} Boardgame</CardTitle>
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
            <Label>Difficulty</Label>
            <RadioGroup 
              value={difficulty} 
              onValueChange={(value) => setDifficulty(value as Difficulty)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy" className="difficulty-easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="difficulty-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard" className="difficulty-hard">Hard</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Tutorial Video URL (optional)</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bggUrl">BoardGameGeek URL (optional)</Label>
            <Input
              id="bggUrl"
              value={bggUrl}
              onChange={(e) => setBggUrl(e.target.value)}
              placeholder="https://boardgamegeek.com/..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
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
