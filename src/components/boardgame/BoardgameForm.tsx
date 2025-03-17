
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Boardgame } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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
  const [complexityRating, setComplexityRating] = useState<number>(boardgame?.complexityRating || 2.5);
  const [videoUrl, setVideoUrl] = useState(boardgame?.videoUrl || '');
  const [bggUrl, setBggUrl] = useState(boardgame?.bggUrl || '');
  const [imageUrl, setImageUrl] = useState(boardgame?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const boardgameData = {
      title,
      description,
      complexityRating,
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

  // Helper function to get the complexity label
  const getComplexityLabel = (value: number) => {
    if (value <= 1.5) return `Light (${value.toFixed(1)})`;
    if (value <= 2.5) return `Medium-Light (${value.toFixed(1)})`;
    if (value <= 3.5) return `Medium (${value.toFixed(1)})`;
    if (value <= 4.5) return `Medium-Heavy (${value.toFixed(1)})`;
    return `Heavy (${value.toFixed(1)})`;
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
          
          <div className="space-y-4">
            <div>
              <Label>Complexity Rating (BGG Scale)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">1</span>
                <Slider
                  value={[complexityRating]}
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setComplexityRating(value[0])}
                  className="flex-1"
                />
                <span className="text-sm">5</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium">{getComplexityLabel(complexityRating)}</span>
            </div>
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
