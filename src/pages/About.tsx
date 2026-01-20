import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Shield, Users, Utensils, BookOpen, Calendar, MessageSquare, ClipboardList, GraduationCap, Bell, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About LunchLit - Your Daily School Companion</title>
        <meta name="description" content="Learn about LunchLit, the comprehensive school companion app designed to help students manage their daily school life." />
      </Helmet>

      <div className="container py-8 max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About LunchLit
          </h1>
          <p className="text-muted-foreground text-lg">Your daily school companion</p>
        </div>

        {/* Mission Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              LunchLit is a comprehensive school companion app designed to help students manage their daily school life. 
              From checking the lunch menu to tracking assignments and finding study halls, we've got you covered.
            </p>
            <p>
              Built by a student, for students — LunchLit understands the challenges of staying organized during the school year 
              and aims to make your academic journey smoother and more enjoyable.
            </p>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Utensils className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Daily Menu</p>
                  <p className="text-xs text-muted-foreground">View lunch menus with dietary information and allergen warnings</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Study Halls</p>
                  <p className="text-xs text-muted-foreground">Find available study spots in real-time between classes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <ClipboardList className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Task Tracking</p>
                  <p className="text-xs text-muted-foreground">Manage assignments and homework with due dates and priorities</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Class Schedule</p>
                  <p className="text-xs text-muted-foreground">Keep track of your daily classes with room numbers and times</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">AI Study Chat</p>
                  <p className="text-xs text-muted-foreground">Get homework help and study assistance from an AI tutor</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Discussions</p>
                  <p className="text-xs text-muted-foreground">Connect with your school community in topic-based forums</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Brag Sheet</p>
                  <p className="text-xs text-muted-foreground">Build your college application profile with activities and achievements</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Notifications</p>
                  <p className="text-xs text-muted-foreground">Stay updated with task reminders and important announcements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Themes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Personalization
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Make LunchLit yours with multiple color themes including Ocean, Forest, Sunset, Midnight, and Lavender. 
              Each theme is carefully designed to provide a comfortable viewing experience while maintaining accessibility.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Your data belongs to you. LunchLit uses secure authentication and follows best practices for data protection. 
              We never share your personal information with third parties, and you can delete your account at any time.
            </p>
          </CardContent>
        </Card>

        {/* Creator Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Created with ❤️ by</p>
              <p className="font-display text-xl font-semibold text-foreground">Ramakrishna Krishna</p>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <Code className="h-3.5 w-3.5" />
                <span>LunchLit © {new Date().getFullYear()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-2">
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}