import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target, Check, Pencil, RotateCcw } from 'lucide-react';

interface StoredFocus {
  date: string;
  text: string;
  done: boolean;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyFocus() {
  const [focus, setFocus] = useState<StoredFocus | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('lunchlit_daily_focus');
    if (raw) {
      try {
        const parsed: StoredFocus = JSON.parse(raw);
        if (parsed.date === todayKey()) {
          setFocus(parsed);
          return;
        }
      } catch {
        // ignore corrupt data
      }
    }
    setEditing(true);
  }, []);

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    const next: StoredFocus = { date: todayKey(), text, done: false };
    localStorage.setItem('lunchlit_daily_focus', JSON.stringify(next));
    setFocus(next);
    setDraft('');
    setEditing(false);
  };

  const toggleDone = () => {
    if (!focus) return;
    const next = { ...focus, done: !focus.done };
    localStorage.setItem('lunchlit_daily_focus', JSON.stringify(next));
    setFocus(next);
  };

  const startEdit = () => {
    setDraft(focus?.text ?? '');
    setEditing(true);
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Today's #1 Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="What's the one thing you want to get done today?"
              maxLength={120}
            />
            <Button onClick={save} disabled={!draft.trim()} className="shrink-0">
              Set Focus
            </Button>
          </div>
        ) : focus ? (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDone}
              className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                focus.done
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/40 hover:border-primary'
              }`}
              aria-label="Toggle complete"
            >
              {focus.done && <Check className="w-4 h-4" />}
            </button>
            <p
              className={`flex-1 font-medium ${
                focus.done ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {focus.text}
            </p>
            <Button variant="ghost" size="icon" onClick={startEdit} aria-label="Edit focus">
              {focus.done ? <RotateCcw className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </Button>
          </div>
        ) : null}
        {focus?.done && (
          <p className="text-xs text-emerald-500 mt-3 font-medium">
            Nice work — you nailed your focus for today! 🎯
          </p>
        )}
      </CardContent>
    </Card>
  );
}
