
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoardgameCard } from '@/components/boardgame/BoardgameCard';
import { Navigation } from '@/components/Navigation';
import { Link } from 'react-router-dom';
import { Search, Gamepad, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Difficulty } from '@/types';

const BoardgameList = () => {
  const { boardgames } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
  
  // Filter boardgames based on search and difficulty filter
  const filteredBoardgames = boardgames.filter(bg => {
    const matchesSearch = bg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === '' || bg.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Boardgame Collection</h1>
            <p className="text-muted-foreground">Browse our collection of available boardgames</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search boardgames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterDifficulty === '' ? 'default' : 'outline'}
                onClick={() => setFilterDifficulty('')}
              >
                All
              </Button>
              <Button
                variant={filterDifficulty === 'easy' ? 'default' : 'outline'}
                className={filterDifficulty === 'easy' ? 'bg-game-easy text-white' : ''}
                onClick={() => setFilterDifficulty('easy')}
              >
                Easy
              </Button>
              <Button
                variant={filterDifficulty === 'medium' ? 'default' : 'outline'}
                className={filterDifficulty === 'medium' ? 'bg-game-medium text-white' : ''}
                onClick={() => setFilterDifficulty('medium')}
              >
                Medium
              </Button>
              <Button
                variant={filterDifficulty === 'hard' ? 'default' : 'outline'}
                className={filterDifficulty === 'hard' ? 'bg-game-hard text-white' : ''}
                onClick={() => setFilterDifficulty('hard')}
              >
                Hard
              </Button>
            </div>
          </div>
        </div>
        
        {filteredBoardgames.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No boardgames found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoardgames.map(boardgame => (
              <BoardgameCard 
                key={boardgame.id} 
                boardgame={boardgame}
                actions={
                  <div className="w-full flex gap-2">
                    {boardgame.bggUrl && (
                      <a 
                        href={boardgame.bggUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          BGG
                        </Button>
                      </a>
                    )}
                    {boardgame.videoUrl && (
                      <a 
                        href={boardgame.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="secondary" className="w-full">
                          Tutorial
                        </Button>
                      </a>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BoardgameList;
