import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Code, Shield, Users, Utensils, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">About LunchLit</h1>
          <p className="text-muted-foreground">Your daily school companion</p>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              What is LunchLit?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              LunchLit is a comprehensive school companion app designed to help students manage their daily school life. 
              From checking the lunch menu to tracking assignments and finding study halls, we've got you covered.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-primary" />
                View daily lunch menus with dietary information
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Find available study halls in real-time
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Connect with school community discussions
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Track tasks and class schedules
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>by</span>
            </div>
            <div className="text-center mt-2">
              <p className="font-semibold text-foreground">Ramakrishna Krishna</p>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <Code className="h-3 w-3" />
              <span>LunchLit © {new Date().getFullYear()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
