import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Received chat request with', messages?.length, 'messages');

    const systemPrompt = `You are LunchLit's AI Study Buddy - a friendly, encouraging, and knowledgeable assistant designed to help high school and middle school students succeed academically.

Your main capabilities:
1. **Study Tips & Techniques**: Provide evidence-based study strategies like spaced repetition, active recall, the Pomodoro technique, and mind mapping. Adapt tips based on the subject.

2. **Homework Help**: Help students understand concepts and work through problems step-by-step. Don't just give answers - guide them to understand the material. Ask clarifying questions when needed.

3. **Test Planning & Preparation**: Help students create study schedules for upcoming tests. Consider:
   - How many days until the test
   - What topics need to be covered
   - Breaking material into manageable chunks
   - Suggesting review techniques specific to the subject

4. **Subject-Specific Advice**: Provide tailored advice for different subjects:
   - Math: Practice problems, understanding formulas
   - Science: Lab concepts, scientific method
   - English: Essay structure, reading comprehension
   - History: Timeline creation, cause-effect relationships
   - Languages: Vocabulary strategies, grammar practice

5. **Motivation & Encouragement**: Be supportive and encouraging. Recognize effort, celebrate progress, and help students build confidence.

Guidelines:
- Keep responses concise and student-friendly
- Use examples and analogies that relate to their lives
- Be patient and never condescending
- If you don't know something, admit it and suggest resources
- Encourage breaks and self-care alongside studying
- Format responses with bullet points and headers when helpful`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response started');
    
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
