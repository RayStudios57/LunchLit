import { useState } from 'react';
import { useStudyHalls, StudyHall } from '@/hooks/useStudyHalls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { MapPin, Users, Clock, Eye, EyeOff, Wifi } from 'lucide-react';

export function StudyHallsRealtime() {
  const { studyHalls, isLoading } = useStudyHalls();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredHalls = showAvailableOnly
    ? studyHalls.filter(hall => hall.is_available)
    : studyHalls;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (studyHalls.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No Study Halls Available</h3>
          <p className="text-sm text-muted-foreground">
            Study halls haven't been set up for your school yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Live Updates</span>
          <Badge variant="outline" className="text-xs">
            {filteredHalls.filter(h => h.is_available).length} available
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Available only</span>
          <Switch
            checked={showAvailableOnly}
            onCheckedChange={setShowAvailableOnly}
          />
        </div>
      </div>

      {/* Study Hall Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredHalls.map((hall, index) => (
          <StudyHallCard key={hall.id} hall={hall} index={index} />
        ))}
      </div>

      {showAvailableOnly && filteredHalls.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="py-8 text-center">
            <EyeOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No available study halls right now</p>
            <Button
              variant="link"
              onClick={() => setShowAvailableOnly(false)}
            >
              Show all study halls
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudyHallCard({ hall, index }: { hall: StudyHall; index: number }) {
  const occupancyPercentage = (hall.current_occupancy / hall.capacity) * 100;
  
  const getOccupancyColor = () => {
    if (occupancyPercentage >= 90) return 'bg-destructive';
    if (occupancyPercentage >= 70) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <Card 
      className={`card-elevated transition-all duration-300 hover:shadow-lg ${
        !hall.is_available ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-display">{hall.name}</CardTitle>
          <Badge 
            variant={hall.is_available ? 'default' : 'secondary'}
            className={hall.is_available ? 'bg-primary' : ''}
          >
            {hall.is_available ? 'Available' : 'Full'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{hall.location}</span>
        </div>
        
        {hall.teacher && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{hall.teacher}</span>
          </div>
        )}

        {/* Live Occupancy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Occupancy
            </span>
            <span className="font-medium">
              {hall.current_occupancy}/{hall.capacity}
            </span>
          </div>
          <div className="relative">
            <Progress value={occupancyPercentage} className="h-2" />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getOccupancyColor()}`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Periods */}
        {hall.periods.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {hall.periods.map((period, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {period}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
