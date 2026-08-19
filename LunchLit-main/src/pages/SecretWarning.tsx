import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { markSecretWarningSeen } from '@/lib/secrets';
import { ExternalLink, ArrowLeft } from 'lucide-react';

const SecretWarning = () => {
  useEffect(() => {
    // Visiting this page unlocks the "Glitch Hunter" secret badge
    markSecretWarningSeen();
  }, []);

  return (
    <>
      <Helmet>
        <title>You Shouldn't Be Here — LunchLIT</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-lg w-full text-center space-y-6 animate-fade-up">
          <p className="text-sm font-mono uppercase tracking-widest text-primary">/secret-warning</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-snug text-foreground">
            I dont know how you got here but this link is to a rickroll so...theres the fair warning
          </h1>
          <p className="text-muted-foreground text-sm">
            Your call mate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Proceed to the video
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Turn back to safety
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/70 font-mono">
            🐛 Glitch Hunter badge unlocked.
          </p>
        </div>
      </div>
    </>
  );
};

export default SecretWarning;
