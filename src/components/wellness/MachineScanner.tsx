import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (/^##\s/.test(line)) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.replace(/^##\s/, '')}</h3>;
    if (/^#\s/.test(line)) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.replace(/^#\s/, '')}</h2>;
    if (/^\s*[-*]\s/.test(line)) return <li key={i} className="ml-4 list-disc">{formatInline(line.replace(/^\s*[-*]\s/, ''))}</li>;
    if (/^\s*\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal">{formatInline(line.replace(/^\s*\d+\.\s/, ''))}</li>;
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm">{formatInline(line)}</p>;
  });
}
function formatInline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>);
}

export function MachineScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please use an image under 8MB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('identify-gym-machine', {
        body: { image },
      });
      if (error) throw error;
      setResult(data.guide);
    } catch (e: unknown) {
      toast({ title: 'Could not analyze image', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-500" />
          Machine Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Snap a photo of a gym machine and get step-by-step instructions on how to use it safely.
        </p>

        {!image ? (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => cameraRef.current?.click()} className="gap-2">
              <Camera className="w-4 h-4" /> Take Photo
            </Button>
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Upload
            </Button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={image} alt="Machine" className="w-full max-h-64 object-contain bg-muted" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={reset}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {!result && (
              <Button onClick={analyze} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  'Identify & explain'
                )}
              </Button>
            )}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1 text-foreground">
            {renderMarkdown(result)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
