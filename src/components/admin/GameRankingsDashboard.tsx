
import { useEffect, useState } from 'react';
import { 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Bar, 
  Tooltip, 
  Legend, 
  LabelList 
} from 'recharts';
import { useApp } from '@/context';
import { Boardgame, Participation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface GameRankingsDashboardProps {
  eventId: string;
  eventBoardgames: Boardgame[];
}

export const GameRankingsDashboard = ({ eventId, eventBoardgames }: GameRankingsDashboardProps) => {
  const { participations, users } = useApp();
  const [chartData, setChartData] = useState<any[]>([]);
  const [detailedData, setDetailedData] = useState<Record<string, any>>({});

  console.log("Participations data:", participations);

  // Process the data for the chart and detailed view
  useEffect(() => {
    if (!eventBoardgames.length) return;
    
    // Get participations for this event
    const eventParticipations = participations.filter(
      p => p.eventId === eventId && p.attending
    );
    
    console.log("Event participations:", eventParticipations);
    
    // Calculate the aggregate rankings for each boardgame
    const aggregateRankings: Record<string, { 
      totalRank: number, 
      votesCount: number, 
      excluded: number,
      includedCount: number,
      averageRank: number 
    }> = {};
    
    // Initialize with all event boardgames
    eventBoardgames.forEach(game => {
      aggregateRankings[game.id] = {
        totalRank: 0,
        votesCount: 0,
        excluded: 0,
        includedCount: 0,
        averageRank: 0
      };
    });
    
    // Aggregate the rankings data
    eventParticipations.forEach(participation => {
      if (!participation.rankings && !participation.excluded) return;
      
      console.log("Checking participation for:", participation.userId || participation.attendeeName);
      console.log("Rankings:", participation.rankings);
      
      // Process rankings
      if (participation.rankings) {
        Object.entries(participation.rankings).forEach(([gameId, rank]) => {
          if (aggregateRankings[gameId]) {
            aggregateRankings[gameId].totalRank += rank;
            aggregateRankings[gameId].votesCount += 1;
          }
        });
      }
      
      // Process exclusions
      if (participation.excluded) {
        participation.excluded.forEach(gameId => {
          if (aggregateRankings[gameId]) {
            aggregateRankings[gameId].excluded += 1;
          }
        });
      }
      
      // Count all games that aren't excluded
      eventBoardgames.forEach(game => {
        if (!participation.excluded?.includes(game.id)) {
          aggregateRankings[game.id].includedCount += 1;
        }
      });
    });
    
    // Calculate averages and prepare chart data
    const chartDataTemp = eventBoardgames.map(game => {
      const gameData = aggregateRankings[game.id];
      const averageRank = gameData.votesCount > 0 
        ? gameData.totalRank / gameData.votesCount 
        : 0;
      
      // Save average rank
      aggregateRankings[game.id].averageRank = averageRank;
      
      return {
        name: game.title,
        averageRank: averageRank,
        included: gameData.includedCount,
        excluded: gameData.excluded,
        totalVotes: gameData.votesCount,
        gameId: game.id
      };
    });
    
    // Sort by average rank (lower is better)
    const sortedChartData = [...chartDataTemp].sort((a, b) => {
      // Games with no votes go to the bottom
      if (a.totalVotes === 0 && b.totalVotes > 0) return 1;
      if (b.totalVotes === 0 && a.totalVotes > 0) return -1;
      
      // Otherwise sort by average rank
      return a.averageRank - b.averageRank;
    });
    
    setChartData(sortedChartData);
    
    // Prepare detailed data with individual rankings
    const detailed: Record<string, any> = {};
    
    eventBoardgames.forEach(game => {
      detailed[game.id] = {
        title: game.title,
        complexity: game.complexityRating,
        participants: []
      };
    });
    
    eventParticipations.forEach(participation => {
      const userName = participation.userId 
        ? users.find(u => u.id === participation.userId)?.name || 'Unknown'
        : participation.attendeeName || 'Guest';
      
      eventBoardgames.forEach(game => {
        const isExcluded = participation.excluded?.includes(game.id);
        const rank = participation.rankings?.[game.id];
        
        detailed[game.id].participants.push({
          name: userName,
          rank: isExcluded ? 'Excluded' : (rank !== undefined ? rank : 'Unranked'),
          userId: participation.userId,
          attendeeName: participation.attendeeName
        });
      });
    });
    
    setDetailedData(detailed);
  }, [eventId, eventBoardgames, participations, users]);

  // Helper for complexity badge
  const getComplexityClass = (rating: number | undefined) => {
    if (!rating) return 'bg-gray-200 text-gray-700';
    if (rating <= 1.5) return 'bg-green-200 text-green-700';
    if (rating <= 2.5) return 'bg-blue-200 text-blue-700';
    if (rating <= 3.5) return 'bg-yellow-200 text-yellow-700';
    if (rating <= 4.5) return 'bg-orange-200 text-orange-700';
    return 'bg-red-200 text-red-700';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Preferences Overview</CardTitle>
          <CardDescription>
            Average ranking of games (lower is better) and exclusion counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0}
                  height={70}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#8884d8" 
                  label={{ value: 'Avg. Rank (lower is better)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#82ca9d"
                  label={{ value: 'Count', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="averageRank" 
                  fill="#8884d8" 
                  name="Average Rank"
                >
                  <LabelList dataKey="averageRank" position="top" formatter={(value: number) => value.toFixed(1)} />
                </Bar>
                <Bar 
                  yAxisId="right" 
                  dataKey="excluded" 
                  fill="#ff8042" 
                  name="Excluded Count"
                >
                  <LabelList dataKey="excluded" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Game Rankings</CardTitle>
          <CardDescription>
            Individual rankings for each game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {chartData.map((game) => (
              <Card key={game.gameId} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getComplexityClass(eventBoardgames.find(bg => bg.id === game.gameId)?.complexityRating)}>
                          Complexity: {eventBoardgames.find(bg => bg.id === game.gameId)?.complexityRating?.toFixed(1) || 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {game.included} interested
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 border-destructive text-destructive">
                          {game.excluded} excluded
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{game.averageRank ? game.averageRank.toFixed(1) : 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Avg. Rank</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead className="text-right">Preference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedData[game.gameId]?.participants.map((participant: any, index: number) => (
                        <TableRow key={participant.userId || participant.attendeeName || index}>
                          <TableCell>{participant.name}</TableCell>
                          <TableCell className="text-right">
                            {participant.rank === 'Excluded' ? (
                              <Badge variant="outline" className="text-destructive border-destructive">
                                Excluded
                              </Badge>
                            ) : participant.rank === 'Unranked' ? (
                              <span className="text-muted-foreground">Unranked</span>
                            ) : (
                              <Badge variant="outline">{participant.rank}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!detailedData[game.gameId]?.participants.length) && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                            No participants have ranked this game yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

            {chartData.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
