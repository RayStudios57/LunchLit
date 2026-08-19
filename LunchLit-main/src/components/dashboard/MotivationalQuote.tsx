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
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", author: "Walter Elliot" },
  { text: "Your education is a dress rehearsal for a life that is yours to lead.", author: "Nora Ephron" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Be curious, not judgmental.", author: "Walt Whitman" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Success doesn't come from what you do occasionally. It comes from what you do consistently.", author: "Marie Forleo" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "Excellence is not a destination but a continuously growing process.", author: "Unknown" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
];

export function MotivationalQuote() {
  const quote = useMemo(() => {
    // Use week number for weekly rotation
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const weekNumber = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    return QUOTES[weekNumber % QUOTES.length];
  }, []);

  return (
    <Card className="card-elevated bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
      <CardContent className="py-5 px-6">
        <div className="flex gap-3">
          <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary/70 mb-1.5 uppercase tracking-wider">Weekly Inspiration</p>
            <p className="text-sm italic text-foreground leading-relaxed">"{quote.text}"</p>
            <p className="text-xs text-muted-foreground mt-1.5">— {quote.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
