import { Helmet } from 'react-helmet';
import { SchoolMenuUpload } from '@/components/menu/SchoolMenuUpload';
import { ThemeLogo } from '@/components/ThemeLogo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MenuUpload() {
  return (
    <>
      <Helmet>
        <title>Upload School Menu | LunchLit</title>
        <meta name="description" content="Schools can upload their meal menus for students to view on LunchLit." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <ThemeLogo />
              <span className="font-display font-bold text-xl">LunchLit</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Link>
            </Button>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl mb-2">School Menu Upload</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Easily publish your school's meal menu for students. Upload your menu in CSV, JSON, or TXT format.
            </p>
          </div>
          
          <SchoolMenuUpload />
        </main>
      </div>
    </>
  );
}
