import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MealItem {
  name: string;
  description?: string;
  calories?: number;
  dietary?: string[];
}

interface ScrapedMeal {
  date: string;
  items: MealItem[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL is from MealViewer
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('mealviewer.com')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Only MealViewer URLs are supported' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching MealViewer URL:', url);

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch MealViewer page:', response.status);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch page: ${response.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('Fetched HTML length:', html.length);

    // Parse menu items from the HTML
    const items = parseMenuItems(html);

    if (items.length === 0) {
      // Try to extract any food-related text as fallback
      const fallbackItems = extractFoodNames(html);
      
      if (fallbackItems.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No menu items found. The page may use dynamic loading. Try copying items manually.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, items: fallbackItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error scraping MealViewer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseMenuItems(html: string): MealItem[] {
  const items: MealItem[] = [];
  const seen = new Set<string>();

  // Common MealViewer patterns for menu items
  const patterns = [
    // Pattern 1: Menu item containers with data attributes
    /data-item-name="([^"]+)"/gi,
    // Pattern 2: Menu item class patterns
    /<div[^>]*class="[^"]*menu-item[^"]*"[^>]*>([^<]+)/gi,
    // Pattern 3: Food name spans
    /<span[^>]*class="[^"]*food-name[^"]*"[^>]*>([^<]+)/gi,
    // Pattern 4: Item title patterns
    /<[^>]*class="[^"]*item-title[^"]*"[^>]*>([^<]+)/gi,
    // Pattern 5: Recipe/dish name patterns
    /<[^>]*class="[^"]*recipe-name[^"]*"[^>]*>([^<]+)/gi,
    // Pattern 6: Meal name patterns
    /<[^>]*class="[^"]*meal-name[^"]*"[^>]*>([^<]+)/gi,
    // Pattern 7: Generic food item patterns
    /class="[^"]*entree[^"]*"[^>]*>([^<]+)/gi,
    /class="[^"]*side[^"]*"[^>]*>([^<]+)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const name = cleanText(match[1]);
      if (name && name.length > 2 && name.length < 100 && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        items.push({ name });
      }
    }
  }

  // Also try to find items in JSON data embedded in the page
  const jsonPatterns = [
    /window\.__INITIAL_STATE__\s*=\s*({.+?});/s,
    /data-menu="([^"]+)"/g,
    /"menuItems"\s*:\s*\[([^\]]+)\]/g,
    /"items"\s*:\s*\[([^\]]+)\]/g,
  ];

  for (const pattern of jsonPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const jsonStr = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(jsonStr);
        extractItemsFromJson(data, items, seen);
      } catch {
        // Not valid JSON, continue
      }
    }
  }

  return items;
}

function extractItemsFromJson(data: unknown, items: MealItem[], seen: Set<string>): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    for (const item of data) {
      extractItemsFromJson(item, items, seen);
    }
  } else if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    
    // Look for name-like fields
    const nameFields = ['name', 'itemName', 'foodName', 'title', 'recipeName', 'mealName'];
    for (const field of nameFields) {
      if (typeof obj[field] === 'string') {
        const name = cleanText(obj[field] as string);
        if (name && name.length > 2 && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          
          const item: MealItem = { name };
          
          if (typeof obj['description'] === 'string') {
            item.description = cleanText(obj['description'] as string);
          }
          if (typeof obj['calories'] === 'number') {
            item.calories = obj['calories'] as number;
          }
          if (Array.isArray(obj['dietary']) || Array.isArray(obj['dietaryTags'])) {
            item.dietary = (obj['dietary'] || obj['dietaryTags']) as string[];
          }
          
          items.push(item);
        }
      }
    }
    
    // Recurse into nested objects
    for (const value of Object.values(obj)) {
      if (typeof value === 'object') {
        extractItemsFromJson(value, items, seen);
      }
    }
  }
}

function extractFoodNames(html: string): MealItem[] {
  const items: MealItem[] = [];
  const seen = new Set<string>();
  
  // Remove script and style tags
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  // Look for common food words in remaining text
  const foodPatterns = [
    /(?:chicken|beef|pork|fish|turkey|ham|bacon|sausage|burger|pizza|pasta|rice|salad|soup|sandwich|wrap|taco|burrito|bowl|steak|wings|nuggets|fries|vegetables?|fruit|bread|roll|milk|juice|water|tea|coffee|dessert|cookie|brownie|cake|pie|yogurt|cheese|eggs?|beans?|corn|potatoes?|carrots?|broccoli|peas|green beans?|mac\s*(?:and|&|'n')?\s*cheese|hot\s*dog|grilled|baked|fried|roasted|steamed)/gi
  ];

  // Find menu-like sections
  const menuSections = cleanHtml.match(/<(?:li|div|span|p)[^>]*>([^<]{3,50})<\/(?:li|div|span|p)>/gi) || [];
  
  for (const section of menuSections) {
    const text = section.replace(/<[^>]+>/g, '').trim();
    
    for (const pattern of foodPatterns) {
      if (pattern.test(text)) {
        const name = cleanText(text);
        if (name && name.length > 2 && name.length < 60 && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          items.push({ name });
        }
        break;
      }
    }
  }

  return items.slice(0, 30); // Limit results
}

function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
