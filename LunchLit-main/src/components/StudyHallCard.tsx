import { Badge } from '@/components/ui/badge';
import { MapPin, User, Users, Clock } from 'lucide-react';

// Support both DB and mock data types
interface StudyHallProps {
  id: string;
  name: string;
  location: string;
  teacher?: string | null;
  capacity: number;
  current_occupancy?: number;
  currentOccupancy?: number;
  is_available?: boolean;
  available?: boolean;
  periods: string[];
}

interface StudyHallCardProps {
  hall: StudyHallProps;
  index: number;
}

export function StudyHallCard({ hall, index }: StudyHallCardProps) {
  // Support both DB naming (current_occupancy/is_available) and mock data naming
  const currentOccupancy = hall.current_occupancy ?? hall.currentOccupancy ?? 0;
  const isAvailable = hall.is_available ?? hall.available ?? true;
  const occupancyPercent = (currentOccupancy / hall.capacity) * 100;
  
  return (
    <div 
      className="card-interactive p-5 opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">
              {hall.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hall.location}</span>
            </div>
          </div>
          <Badge variant={isAvailable ? 'available' : 'busy'}>
            {isAvailable ? 'Available' : 'Full'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {hall.teacher && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{hall.teacher}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{currentOccupancy}/{hall.capacity}</span>
          </div>
        </div>
        
        {/* Occupancy bar */}
        <div className="space-y-1.5">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercent >= 100 
                  ? 'bg-destructive' 
                  : occupancyPercent >= 75 
                    ? 'bg-warning' 
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          {hall.periods.map((period) => (
            <span key={period} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
              {period}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
