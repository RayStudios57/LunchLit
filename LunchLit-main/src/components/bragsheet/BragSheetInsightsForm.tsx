import { useState } from 'react';
import { useBragSheetInsights, INSIGHT_QUESTIONS } from '@/hooks/useBragSheetInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, Check, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function BragSheetInsightsForm() {
  const { insights, isLoading, saveInsight, getInsightAnswer } = useBragSheetInsights();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(getInsightAnswer(key));
  };

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      await saveInsight.mutateAsync({ question_key: key, answer: editValue });
      setEditingKey(null);
    } finally {
      setSavingKey(null);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  const answeredCount = insights.filter(i => i.answer && i.answer.trim().length > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Insight Questions
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {answeredCount} of {INSIGHT_QUESTIONS.length} answered
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Provide detailed answers to help your recommenders write strong letters.
        </p>
        
        <Accordion type="single" collapsible className="space-y-2">
          {INSIGHT_QUESTIONS.map((q, idx) => {
            const answer = getInsightAnswer(q.key);
            const hasAnswer = answer && answer.trim().length > 0;
            const isEditing = editingKey === q.key;
            
            return (
              <AccordionItem key={q.key} value={q.key} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-start gap-3 text-left">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {hasAnswer ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <span className="text-sm">{q.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={4}
                        placeholder="Type your answer here..."
                        className="resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(q.key)}
                          disabled={savingKey === q.key}
                        >
                          {savingKey === q.key ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Save'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      {hasAnswer ? (
                        <div className="space-y-3">
                          <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                            {answer}
                          </p>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(q.key)}>
                            Edit Answer
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleEdit(q.key)}>
                          Add Answer
                        </Button>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
