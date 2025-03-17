
import { Boardgame } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardgameCardProps {
  boardgame: Boardgame;
  actions?: React.ReactNode;
  compact?: boolean;
}

export const BoardgameCard = ({ boardgame, actions, compact = false }: BoardgameCardProps) => {
  const { title, description, difficulty, videoUrl, bggUrl, imageUrl } = boardgame;
  
  return (
    <Card className={`h-full flex flex-col ${compact ? 'shadow-sm' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
      {!compact && imageUrl && (
        <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className={compact ? 'py-3 px-4' : ''}>
        <div className="flex justify-between items-start">
          <CardTitle className={compact ? 'text-base' : 'text-xl'}>{title}</CardTitle>
          <Badge className={`difficulty-${difficulty}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
        {!compact && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      {!compact && (
        <CardContent className="flex-grow">
          <div className="space-y-2">
            {(videoUrl || bggUrl) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {videoUrl && (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Video className="h-4 w-4 mr-1" />
                      Tutorial
                    </Button>
                  </a>
                )}
                {bggUrl && (
                  <a href={bggUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      BGG
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {actions && (
        <CardFooter className={`${compact ? 'pt-2 pb-3 px-4' : ''} mt-auto`}>
          {actions}
        </CardFooter>
      )}
    </Card>
  );
};
