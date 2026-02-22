import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Shield, Users, Utensils, BookOpen, Calendar, MessageSquare, ClipboardList, GraduationCap, Bell, Palette, History, ShieldBan } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CreatorSocialLinks } from '@/components/about/CreatorSocialLinks';
import { SuggestionsSection } from '@/components/about/SuggestionsSection';
const CURRENT_VERSION = '0.8';
const changelogData = [{
  version: '0.8',
  date: 'February 2026',
  changes: ['Interactive 11-step onboarding tutorial for new users', 'Replay tutorial anytime from Settings', 'Admin feedback management with email notifications', 'Admin account deletion and request management', 'Admin user activity tracking']
}, {
  version: '0.7',
  date: 'February 2026',
  changes: ['We finally figured out how to add Google authentication, Yippee :)']
}, {
  version: '0.6',
  date: 'February 2026',
  changes: ['Fancy PDF export with embedded images and visual styling', 'Common App format PDF export matching college application layouts', 'Drag-and-drop activity reordering for Brag Sheet priorities', 'Admin-only Presentation Mode with dummy data for demos', 'Student Portfolio with goals, target schools, and college predictor']
}, {
  version: '0.5',
  date: 'January 2026',
  changes: ['Real-time Brag Sheet system for tracking achievements', 'Grade level progression with historical records', 'Academics section with GPA, test scores, and courses', 'PDF export for Brag Sheet with full profile', 'Meal preview and MealViewer import for admins']
}, {
  version: '0.4',
  date: 'December 2025',
  changes: ['Manual Brag Sheet entry management with structured fields', 'Auto-suggested entries based on completed tasks', 'Updated grade level selection (5th-12th grade)']
}, {
  version: '0.3',
  date: 'December 2025',
  changes: ['Theme customization with multiple light/dark themes', 'Theme-aware app logos', 'Dedicated Tasks / To-Do tab', 'Centralized Settings page', 'Google Calendar export and syncing']
}, {
  version: '0.2',
  date: 'December 2025',
  changes: ['Today dashboard widget with upcoming classes/tasks', 'Import/export for schedules and tasks (CSV/JSON)', 'Grade level selection during onboarding', 'Discussion/community tab for communication']
}, {
  version: '0.1',
  date: 'December 2025',
  changes: ['Core student dashboard', 'Class schedule viewer', 'School meal display', 'Basic task and planning functionality', 'Study halls and open periods finder']
}];
export default function About() {
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>About LunchLit - Your Daily School Companion</title>
        <meta name="description" content="Learn about LunchLit, the comprehensive school companion app designed to help students manage their daily school life." />
      </Helmet>

      <div className="container py-8 max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">About LunchLIT

        </h1>
          <p className="text-muted-foreground text-lg">Your daily school companion</p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>LIT</strong> = <strong>L</strong>earning, <strong>I</strong>nsight, <strong>T</strong>racking
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Code className="h-3.5 w-3.5" />
            Version {CURRENT_VERSION}
          </div>
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
            <p>LunchLIT is a comprehensive school companion app designed to help students manage their daily school life. From checking the lunch menu to tracking assignments and finding study halls, we've got you covered.


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

        {/* Changelog Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              What's New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="0.4" className="w-full">
              {changelogData.map((release) => <AccordionItem key={release.version} value={release.version}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        v{release.version}
                      </span>
                      <span className="text-sm text-muted-foreground">{release.date}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-1">
                      {release.changes.map((change, idx) => <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1.5">•</span>
                          {change}
                        </li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
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
            <p>Make LunchLIT yours with multiple color themes including Ocean, Forest, Sunset, Midnight, and Lavender. Each theme is carefully designed to provide a comfortable viewing experience while maintaining accessibility.


          </p>
          </CardContent>
        </Card>

        {/* Privacy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldBan className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>Your data belongs to you. LunchLIT uses secure authentication and follows best practices for data protection. We never share your personal information with third parties, and you can delete your account at any time.


          </p>
          </CardContent>
        </Card>

        {/* Suggestions Section */}
        <SuggestionsSection />

        {/* Creator Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Created by</p>
              <div className="space-y-1">
                <p className="font-display text-xl font-semibold text-foreground">Ramakrishna Krishna</p>
                <p className="font-display text-lg text-foreground">Assisted by Alex Quinones</p>
              </div>
              
              {/* Dynamic Social Links */}
              <CreatorSocialLinks />

              <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted-foreground">
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
    </div>;
}