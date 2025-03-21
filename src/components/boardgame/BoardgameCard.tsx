
import { Boardgame } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardgameCardProps {
  boardgame: Boardgame;
  actions?: React.ReactNode;
  compact?: boolean;
}

export const BoardgameCard = ({ boardgame, actions, compact = false }: BoardgameCardProps) => {
  const { title, description, complexityRating, videoUrl, bggUrl, imageUrl } = boardgame;
  
  // Helper function to get the complexity label and class
  const getComplexityInfo = (rating: number) => {
    if (rating <= 1.5) return { label: `Light (${rating})`, className: 'complexity-light' };
    if (rating <= 2.5) return { label: `Medium-Light (${rating})`, className: 'complexity-medium-light' };
    if (rating <= 3.5) return { label: `Medium (${rating})`, className: 'complexity-medium' };
    if (rating <= 4.5) return { label: `Medium-Heavy (${rating})`, className: 'complexity-medium-heavy' };
    return { label: `Heavy (${rating})`, className: 'complexity-heavy' };
  };
  
  const complexityInfo = getComplexityInfo(complexityRating);
  
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
          <Badge className={complexityInfo.className}>
            {complexityInfo.label}
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
