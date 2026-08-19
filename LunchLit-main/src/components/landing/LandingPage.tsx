import { ThemeLogo } from '@/components/ThemeLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  HeartPulse, Dumbbell, Camera, BookOpen, ListChecks, BarChart2,
  CalendarDays, MessageSquare, Users, Shield, Trophy, Bot,
  Bell, Flame, Smartphone, ArrowRight, Sparkles, ShieldCheck,
} from 'lucide-react';

const FEATURES = [
  {
    icon: HeartPulse,
    title: 'Wellness Hub',
    desc: 'Mood, hydration, breathing, and easy snacks of the day.',
  },
  {
    icon: Dumbbell,
    title: 'Fitness Tools',
    desc: 'Goal-based recommendations and custom gym routines.',
  },
  {
    icon: Camera,
    title: 'Machine Scanner',
    desc: 'AI explains how to use any gym machine from a photo.',
  },
  {
    icon: BookOpen,
    title: 'Study Halls',
    desc: 'Find available study spots in real-time.',
  },
  {
    icon: ListChecks,
    title: 'Task Tracking',
    desc: 'Manage assignments with due dates and priorities.',
  },
  {
    icon: BarChart2,
    title: 'Study Stats',
    desc: 'Productivity trends, streaks, and weekly progress.',
  },
  {
    icon: CalendarDays,
    title: 'Class Schedule',
    desc: 'Track daily classes with room numbers and times.',
  },
  {
    icon: Bot,
    title: 'AI Study Chat',
    desc: 'Get homework help from an AI tutor.',
  },
  {
    icon: MessageSquare,
    title: 'Discussions',
    desc: 'Connect with your school community.',
  },
  {
    icon: Shield,
    title: 'Brag Sheet',
    desc: 'Build your college application profile.',
  },
  {
    icon: Trophy,
    title: '54 Badges',
    desc: 'Unlock achievements across 16 categories.',
  },
  {
    icon: Users,
    title: 'Friends',
    desc: 'Connect with classmates, cheer them on.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Task reminders and announcements.',
  },
  {
    icon: Flame,
    title: 'Streak Tracker',
    desc: 'Track daily consistency.',
  },
  {
    icon: Smartphone,
    title: 'PWA Install',
    desc: 'Add to your phone home screen.',
  },
];

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="container flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <ThemeLogo size="md" />
          <span className="font-display font-bold text-xl">LunchLit</span>
        </div>
        <Button onClick={onGetStarted} variant="outline">Sign in</Button>
      </header>

      {/* Hero */}
      <section className="container py-16 sm:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="animate-fade-up max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Your all-in-one student companion
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl leading-tight tracking-tight">
            School, wellness &amp; goals —{' '}
            <span className="text-primary">all in one place.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            LunchLit helps students manage classes, track wellness and fitness, plan their day,
            find study halls, and get instant AI study help — built for grades 5 through 12.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={onGetStarted} className="gap-2">
              Get started free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/about">Learn more</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free to use · Installable as an app · No credit card</p>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl">Everything students actually need</h2>
          <p className="text-muted-foreground mt-2">One app, less app-switching.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="card-elevated hover:-translate-y-1 transition-transform">
              <CardContent className="p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust / community */}
      <section className="container py-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/40">
            <Users className="w-6 h-6 text-primary shrink-0" />
            <p className="text-sm">Connect with friends &amp; share schedules</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/40">
            <CalendarDays className="w-6 h-6 text-primary shrink-0" />
            <p className="text-sm">Sync your planner with Google Calendar</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/40">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <p className="text-sm">Privacy-first with full control of your data</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20">
        <Card className="card-elevated bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-10 text-center">
            <h2 className="font-display font-bold text-3xl">Ready to level up your school day?</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Join LunchLit and bring your classes, wellness, and goals together.
            </p>
            <Button size="lg" onClick={onGetStarted} className="mt-6 gap-2">
              Get started free <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="container py-8 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} LunchLit · <a href="/about" className="hover:text-foreground">About</a>
      </footer>
    </div>
  );
}
