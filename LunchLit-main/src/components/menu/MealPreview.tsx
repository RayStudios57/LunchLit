import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, Flame } from 'lucide-react';
import { format } from 'date-fns';

interface MealItem {
  name: string;
  description?: string;
  calories?: number;
  dietary?: string[];
}

interface MealPreviewProps {
  date: Date;
  mealType: string;
  items: MealItem[];
  dietaryTags: { name: string; color: string }[];
}

export function MealPreview({ date, mealType, items, dietaryTags }: MealPreviewProps) {
  const validItems = items.filter(i => i.name.trim());
  
  const getTagColor = (tagName: string) => {
    return dietaryTags.find(t => t.name === tagName)?.color || '#888888';
  };

  if (validItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Add menu items to see preview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Student Preview
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {mealType}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {validItems.map((item, index) => (
          <div 
            key={index} 
            className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              {item.calories && item.calories > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3" />
                  {item.calories} cal
                </div>
              )}
            </div>
            {item.dietary && item.dietary.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.dietary.map((tag) => (
                  <Badge 
                    key={tag} 
                    className="text-[10px] px-1.5 py-0"
                    style={{ backgroundColor: getTagColor(tag), color: 'white' }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            This is how students will see this meal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
