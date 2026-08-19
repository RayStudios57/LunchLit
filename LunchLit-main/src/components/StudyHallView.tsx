import { useState } from 'react';
import { studyHalls } from '@/data/mockData';
import { StudyHallCard } from './StudyHallCard';
import { CheckCircle, Circle } from 'lucide-react';

export function StudyHallView() {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredHalls = showAvailableOnly
    ? studyHalls.filter((hall) => hall.available)
    : studyHalls;

  const availableCount = studyHalls.filter((h) => h.available).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Stats & Filter */}
      <div className="card-elevated p-5 opacity-0 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground mb-1">
              Study Hall Availability
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">{availableCount}</span> of {studyHalls.length} spots currently available
            </p>
          </div>
          
          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              showAvailableOnly
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {showAvailableOnly ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            Available only
          </button>
        </div>
      </div>

      {/* Study Halls Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredHalls.map((hall, index) => (
          <StudyHallCard key={hall.id} hall={hall} index={index} />
        ))}
      </div>

      {filteredHalls.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground">No study halls available at the moment.</p>
          <button
            onClick={() => setShowAvailableOnly(false)}
            className="mt-4 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Show all study halls
          </button>
        </div>
      )}
    </div>
  );
}
