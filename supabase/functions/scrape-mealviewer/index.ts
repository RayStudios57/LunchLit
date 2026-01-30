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

interface DayMeals {
  date: string;
  items: MealItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, multiDay = false } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('mealviewer.com')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Only MealViewer URLs are supported' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching MealViewer URL:', url, 'multiDay:', multiDay);

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

    // Try to extract multi-day meals first
    if (multiDay) {
      const days = parseMultiDayMeals(html);
      if (days.length > 0) {
        console.log(`Found ${days.length} days of meals`);
        return new Response(
          JSON.stringify({ success: true, days }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fall back to single-day parsing
    const items = parseMenuItems(html);

    if (items.length === 0) {
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

function parseMultiDayMeals(html: string): DayMeals[] {
  const days: DayMeals[] = [];
  const seenDates = new Set<string>();

  // Pattern 1: Look for JSON data with date structures
  const jsonPatterns = [
    /window\.__INITIAL_STATE__\s*=\s*({.+?});/s,
    /window\.__NUXT__\s*=\s*({.+?});/s,
    /"menuData"\s*:\s*({.+?})\s*[,}]/s,
    /"weekMenu"\s*:\s*(\[.+?\])\s*[,}]/s,
    /"dailyMenus"\s*:\s*(\[.+?\])\s*[,}]/s,
  ];

  for (const pattern of jsonPatterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1].replace(/&quot;/g, '"');
        const data = JSON.parse(jsonStr);
        extractDaysFromJson(data, days, seenDates);
      } catch (e) {
        console.log('JSON parse failed:', e);
      }
    }
  }

  // Pattern 2: Look for date-based sections in HTML
  const datePatterns = [
    // Common date formats in HTML
    /(?:data-date|data-menu-date)="(\d{4}-\d{2}-\d{2})"/gi,
    /(?:class="[^"]*day[^"]*"[^>]*data-date)="(\d{4}-\d{2}-\d{2})"/gi,
  ];

  const foundDates: string[] = [];
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (!seenDates.has(match[1])) {
        foundDates.push(match[1]);
        seenDates.add(match[1]);
      }
    }
  }

  // If we found dates but no structured data, try to extract items near each date
  if (foundDates.length > 0 && days.length === 0) {
    for (const date of foundDates) {
      const items = extractItemsNearDate(html, date);
      if (items.length > 0) {
        days.push({ date, items });
      }
    }
  }

  // Pattern 3: Look for weekday-based sections
  if (days.length === 0) {
    const weekdayDays = extractWeekdayMeals(html);
    if (weekdayDays.length > 0) {
      return weekdayDays;
    }
  }

  // Sort by date
  days.sort((a, b) => a.date.localeCompare(b.date));

  return days;
}

function extractDaysFromJson(data: unknown, days: DayMeals[], seenDates: Set<string>): void {
  if (!data) return;

  if (Array.isArray(data)) {
    for (const item of data) {
      extractDaysFromJson(item, days, seenDates);
    }
    return;
  }

  if (typeof data !== 'object') return;

  const obj = data as Record<string, unknown>;

  // Look for date + items/menu structure
  const dateFields = ['date', 'menuDate', 'day', 'dateStr'];
  const itemFields = ['items', 'menuItems', 'foods', 'meals', 'menu'];

  let foundDate: string | null = null;
  let foundItems: MealItem[] = [];

  for (const dateField of dateFields) {
    const dateValue = obj[dateField];
    if (typeof dateValue === 'string') {
      // Check if it looks like a date
      if (/\d{4}-\d{2}-\d{2}/.test(dateValue) || /\d{1,2}\/\d{1,2}\/\d{4}/.test(dateValue)) {
        foundDate = normalizeDate(dateValue);
        break;
      }
    }
  }

  for (const itemField of itemFields) {
    const itemsValue = obj[itemField];
    if (Array.isArray(itemsValue)) {
      for (const item of itemsValue) {
        const mealItem = extractMealItem(item);
        if (mealItem) {
          foundItems.push(mealItem);
        }
      }
    }
  }

  if (foundDate && foundItems.length > 0 && !seenDates.has(foundDate)) {
    seenDates.add(foundDate);
    days.push({ date: foundDate, items: foundItems });
  }

  // Recurse into nested objects
  for (const value of Object.values(obj)) {
    if (typeof value === 'object') {
      extractDaysFromJson(value, days, seenDates);
    }
  }
}

function extractMealItem(data: unknown): MealItem | null {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;
  const nameFields = ['name', 'itemName', 'foodName', 'title', 'recipeName', 'mealName', 'displayName'];

  for (const field of nameFields) {
    if (typeof obj[field] === 'string') {
      const name = cleanText(obj[field] as string);
      if (name && name.length > 2) {
        const item: MealItem = { name };

        if (typeof obj['description'] === 'string') {
          item.description = cleanText(obj['description'] as string);
        }
        if (typeof obj['calories'] === 'number') {
          item.calories = obj['calories'] as number;
        } else if (typeof obj['calories'] === 'string') {
          const cal = parseInt(obj['calories'] as string);
          if (!isNaN(cal)) item.calories = cal;
        }
        if (Array.isArray(obj['dietary']) || Array.isArray(obj['dietaryTags'])) {
          item.dietary = (obj['dietary'] || obj['dietaryTags']) as string[];
        }

        return item;
      }
    }
  }

  return null;
}

function normalizeDate(dateStr: string): string {
  // Try to normalize to YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Handle MM/DD/YYYY
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Return original if can't parse
  return dateStr;
}

function extractItemsNearDate(html: string, date: string): MealItem[] {
  const items: MealItem[] = [];
  const seen = new Set<string>();

  // Find the position of the date in HTML
  const dateIndex = html.indexOf(date);
  if (dateIndex === -1) return items;

  // Extract a section around the date (roughly 5000 chars after)
  const section = html.substring(dateIndex, dateIndex + 5000);

  // Look for food items in this section
  const patterns = [
    /<[^>]*class="[^"]*(?:menu-item|food-name|item-title|recipe-name)[^"]*"[^>]*>([^<]+)/gi,
    /data-item-name="([^"]+)"/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(section)) !== null) {
      const name = cleanText(match[1]);
      if (name && name.length > 2 && name.length < 100 && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        items.push({ name });
      }
    }
  }

  return items;
}

function extractWeekdayMeals(html: string): DayMeals[] {
  const days: DayMeals[] = [];
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Get current week dates
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  for (let i = 0; i < weekdays.length; i++) {
    const weekday = weekdays[i];
    const dayRegex = new RegExp(`${weekday}[^<]*(?:<[^>]*>)*([\\s\\S]{0,3000}?)(?:${weekdays[i + 1] || 'Saturday'})`, 'i');
    const match = html.match(dayRegex);

    if (match) {
      const section = match[1];
      const items = extractFoodFromSection(section);

      if (items.length > 0) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        days.push({ date: dateStr, items });
      }
    }
  }

  return days;
}

function extractFoodFromSection(section: string): MealItem[] {
  const items: MealItem[] = [];
  const seen = new Set<string>();

  // Remove HTML tags and find food-like text
  const cleaned = section.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  const foodPatterns = [
    /(?:chicken|beef|pork|fish|turkey|ham|bacon|sausage|burger|pizza|pasta|rice|salad|soup|sandwich|wrap|taco|burrito|bowl|steak|wings|nuggets|fries|vegetables?|fruit|bread|roll|milk|juice|dessert|cookie|brownie|cake|yogurt|cheese|eggs?|beans?|corn|potatoes?|mac\s*(?:and|&)?\s*cheese|hot\s*dog|grilled|baked|fried|roasted)/gi
  ];

  const sentences = cleaned.split(/[.;,]/).filter(s => s.trim().length > 3 && s.trim().length < 100);

  for (const sentence of sentences) {
    for (const pattern of foodPatterns) {
      if (pattern.test(sentence)) {
        const name = cleanText(sentence);
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          items.push({ name });
        }
        break;
      }
    }
  }

  return items.slice(0, 15);
}

function parseMenuItems(html: string): MealItem[] {
  const items: MealItem[] = [];
  const seen = new Set<string>();

  const patterns = [
    /data-item-name="([^"]+)"/gi,
    /<div[^>]*class="[^"]*menu-item[^"]*"[^>]*>([^<]+)/gi,
    /<span[^>]*class="[^"]*food-name[^"]*"[^>]*>([^<]+)/gi,
    /<[^>]*class="[^"]*item-title[^"]*"[^>]*>([^<]+)/gi,
    /<[^>]*class="[^"]*recipe-name[^"]*"[^>]*>([^<]+)/gi,
    /<[^>]*class="[^"]*meal-name[^"]*"[^>]*>([^<]+)/gi,
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

  // Also try JSON embedded data
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
  
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  const foodPatterns = [
    /(?:chicken|beef|pork|fish|turkey|ham|bacon|sausage|burger|pizza|pasta|rice|salad|soup|sandwich|wrap|taco|burrito|bowl|steak|wings|nuggets|fries|vegetables?|fruit|bread|roll|milk|juice|water|tea|coffee|dessert|cookie|brownie|cake|pie|yogurt|cheese|eggs?|beans?|corn|potatoes?|carrots?|broccoli|peas|green beans?|mac\s*(?:and|&|'n')?\s*cheese|hot\s*dog|grilled|baked|fried|roasted|steamed)/gi
  ];

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

  return items.slice(0, 30);
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
