// Searches the live web for scholarship opportunities using Firecrawl.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

interface ReqBody {
  category?: 'local' | 'national' | 'school' | 'general';
  location?: string;
  schoolName?: string;
  gradeLevel?: string;
  keywords?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: 'Scholarship search not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ReqBody = await req.json().catch(() => ({}));
    const category = body.category ?? 'general';

    let query = '';
    switch (category) {
      case 'local':
        query = `local high school scholarships ${body.location ?? ''} 2026 deadline application`.trim();
        break;
      case 'school':
        query = `${body.schoolName ?? ''} college scholarships financial aid undergraduate 2026`.trim();
        break;
      case 'national':
        query = `national scholarships for ${body.gradeLevel ?? 'high school'} students 2026 deadline ${body.keywords ?? ''}`.trim();
        break;
      default:
        query = `scholarships for students ${body.keywords ?? ''} 2026 deadline application`.trim();
    }

    const fcRes = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 10,
        tbs: 'qdr:m', // last month for freshness
      }),
    });

    if (!fcRes.ok) {
      const txt = await fcRes.text();
      console.error('Firecrawl error', fcRes.status, txt);
      return new Response(JSON.stringify({ error: 'Search failed', details: txt.slice(0, 200) }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fcJson = await fcRes.json();
    // Firecrawl v2 search may return either { data: [...] } or { web: [...] } depending on shape
    const items: Record<string, string>[] = Array.isArray(fcJson?.data)
      ? fcJson.data
      : Array.isArray(fcJson?.web)
        ? fcJson.web
        : Array.isArray(fcJson?.data?.web)
          ? fcJson.data.web
          : [];

    const scholarships = items.slice(0, 10).map((it) => ({
      title: it.title || it.name || 'Scholarship',
      url: it.url || it.link || '',
      description: (it.description || it.snippet || '').slice(0, 300),
    })).filter((s) => s.url);

    return new Response(JSON.stringify({ scholarships, query }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('find-scholarships error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
