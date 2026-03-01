import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Utensils, Book, Trophy, Target, CheckSquare, Users, BookOpen, MessageCircle, GraduationCap, ArrowRight, ArrowLeft, Sparkles, Timer, Calculator, Award, Download } from 'lucide-react';

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: Sparkles,
    title: 'Welcome to LunchLIT!',
    description: 'Your all-in-one school companion. Let\'s take a quick tour of everything you can do here.',
    color: 'from-primary to-accent',
  },
  {
    icon: Calendar,
    title: 'Today View',
    description: 'Your daily dashboard shows upcoming classes, tasks due today, today\'s lunch menu, and quick-glance widgets — all in one place.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Utensils,
    title: 'Lunch Menu',
    description: 'Check what\'s for lunch every day. Browse weekly and monthly menus with dietary info and meal details.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Book,
    title: 'Classes',
    description: 'Add your class schedule with times, rooms, and teachers. See what\'s next at a glance.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Trophy,
    title: 'Brag Sheet',
    description: 'Track your achievements, awards, volunteering, and extracurriculars. Perfect for college applications.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Portfolio',
    description: 'Build your student portfolio with goals, target schools, and a college predictor to plan your future.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: CheckSquare,
    title: 'Tasks & Planner',
    description: 'Manage homework and tasks with due dates, priorities, and categories. Never miss an assignment.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: Timer,
    title: 'Pomodoro Study Timer',
    description: 'Stay focused with 25-minute study sessions and timed breaks. Link a task and optionally play lofi music while you study.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Calculator,
    title: 'GPA Calculator',
    description: 'Calculate your GPA right from the dashboard. Add courses, grades, and credits to stay on top of your academics.',
    color: 'from-sky-500 to-blue-500',
  },
  {
    icon: Award,
    title: 'Achievement Badges',
    description: 'Earn badges for completing tasks, building your Brag Sheet, and staying consistent. Check your badges in Settings!',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join school discussions, share tips, and connect with classmates in your school\'s community board.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: BookOpen,
    title: 'Study Hall & Tutors',
    description: 'Find available study halls in real-time and connect with tutors for extra help.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: MessageCircle,
    title: 'AI Chat',
    description: 'Got a question? Chat with our AI assistant for homework help, study tips, and more.',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: Download,
    title: 'Install LunchLIT',
    description: 'Add LunchLIT to your phone\'s home screen for quick access! Go to your browser settings and tap "Add to Home Screen" or "Install App".',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: GraduationCap,
    title: 'You\'re All Set!',
    description: 'Start exploring LunchLIT! You can always replay this tutorial from Settings.',
    color: 'from-primary to-accent',
  },
];

interface OnboardingTutorialProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingTutorial({ open, onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const totalSteps = TUTORIAL_STEPS.length;
  const current = TUTORIAL_STEPS[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete();
      setStep(0);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    onComplete();
    setStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden gap-0" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Colored header */}
        <div className={`bg-gradient-to-br ${current.color} p-8 flex flex-col items-center text-white`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
            <Icon className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-center">{current.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-center text-muted-foreground leading-relaxed">
            {current.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'bg-primary w-6' 
                    : i < step 
                      ? 'bg-primary/40' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip
              </Button>
            )}

            <span className="text-xs text-muted-foreground">
              {step + 1} / {totalSteps}
            </span>

            <Button size="sm" onClick={handleNext}>
              {step === totalSteps - 1 ? 'Get Started' : 'Next'}
              {step < totalSteps - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
