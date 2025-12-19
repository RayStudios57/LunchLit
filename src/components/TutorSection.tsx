import { GraduationCap, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tutor {
  id: string;
  name: string;
  subject: string;
  availability: string;
  rating: number;
  image?: string;
}

const tutors: Tutor[] = [
  {
    id: '1',
    name: 'Ms. Rodriguez',
    subject: 'Mathematics',
    availability: 'Mon, Wed, Fri - Period 6',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Mr. Thompson',
    subject: 'Science & Chemistry',
    availability: 'Tue, Thu - Period 4',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Mrs. Chen',
    subject: 'English & Writing',
    availability: 'Mon-Fri - Period 7',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Mr. Patel',
    subject: 'History & Social Studies',
    availability: 'Wed, Fri - Period 5',
    rating: 4.9,
  },
];

export function TutorSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-info-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">Tutoring</h2>
            <p className="text-sm text-muted-foreground">Get help from our staff</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tutors.map((tutor, index) => (
          <div
            key={tutor.id}
            className="card-interactive p-4 opacity-0 animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{tutor.name}</h3>
                    <p className="text-sm text-primary font-medium">{tutor.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-accent shrink-0">
                    <Star className="w-4 h-4 fill-accent" />
                    <span className="font-medium">{tutor.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tutor.availability}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 justify-between text-muted-foreground hover:text-foreground"
            >
              <span>Request Session</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Tutoring is optional and available during free periods. Sign up at the front office.
      </p>
    </section>
  );
}
