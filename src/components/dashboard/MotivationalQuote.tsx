import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { useMemo } from 'react';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Study hard, for the well is deep, and our brains are shallow.", author: "Richard Baxter" },
];

export function MotivationalQuote() {
  const quote = useMemo(() => {
    // Use day of year for daily rotation
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <Card className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
      <CardContent className="py-5 px-6">
        <div className="flex gap-3">
          <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm italic text-foreground leading-relaxed">"{quote.text}"</p>
            <p className="text-xs text-muted-foreground mt-1.5">— {quote.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
