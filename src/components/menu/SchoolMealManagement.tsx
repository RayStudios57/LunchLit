import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchools } from '@/hooks/useSchools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Utensils, Loader2, Tag, CalendarIcon, ExternalLink, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { MealPreview } from './MealPreview';
import { MealViewerImport } from './MealViewerImport';

interface DietaryTag {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  school_id: string | null;
}

interface MealSchedule {
  id: string;
  school_id: string;
  meal_date: string;
  meal_type: string;
  menu_items: { name: string; description?: string; calories?: number; dietary?: string[] }[];
}

export function SchoolMealManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#10b981' });
  const [newMeal, setNewMeal] = useState({
    school_id: '',
    meal_date: '',
    meal_type: 'lunch',
    items: [{ name: '', description: '', calories: 0, dietary: [] as string[] }],
  });

  const { data: dietaryTags = [], isLoading: loadingTags } = useQuery({
    queryKey: ['dietary-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_dietary_tags')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as DietaryTag[];
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: mealSchedules = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['admin-meals-calendar', selectedSchool, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      let query = supabase
        .from('meal_schedules')
        .select('*')
        .gte('meal_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('meal_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('meal_date');
      
      if (selectedSchool) {
        query = query.eq('school_id', selectedSchool);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as MealSchedule[];
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from('meal_dietary_tags')
        .insert(tag)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietary-tags'] });
      toast({ title: 'Dietary tag added' });
      setIsAddTagOpen(false);
      setNewTag({ name: '', color: '#10b981' });
    },
    onError: (error) => {
      toast({ title: 'Error adding tag', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meal_dietary_tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietary-tags'] });
      toast({ title: 'Tag deleted' });
    },
  });

  const addMeal = useMutation({
    mutationFn: async (meal: typeof newMeal) => {
      const { data, error } = await supabase
        .from('meal_schedules')
        .insert({
          school_id: meal.school_id,
          meal_date: meal.meal_date,
          meal_type: meal.meal_type,
          menu_items: meal.items.filter(i => i.name.trim()),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meals-calendar'] });
      toast({ title: 'Meal schedule added' });
      setIsAddMealOpen(false);
      resetMealForm();
    },
    onError: (error) => {
      toast({ title: 'Error adding meal', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('meal_schedules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meals-calendar'] });
      toast({ title: 'Meal deleted' });
    },
  });

  const resetMealForm = () => {
    setNewMeal({
      school_id: selectedSchool,
      meal_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      meal_type: 'lunch',
      items: [{ name: '', description: '', calories: 0, dietary: [] }],
    });
  };

  const addMealItem = () => {
    setNewMeal(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', calories: 0, dietary: [] }],
    }));
  };

  const updateMealItem = (index: number, field: string, value: unknown) => {
    setNewMeal(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeMealItem = (index: number) => {
    setNewMeal(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const openAddMealForDate = (date: Date) => {
    setSelectedDate(date);
    setNewMeal({
      school_id: selectedSchool,
      meal_date: format(date, 'yyyy-MM-dd'),
      meal_type: 'lunch',
      items: [{ name: '', description: '', calories: 0, dietary: [] }],
    });
    setIsAddMealOpen(true);
  };

  const getMealsForDate = (date: Date) => {
    return mealSchedules.filter(meal => isSameDay(parseISO(meal.meal_date), date));
  };

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              School Meal Management
            </CardTitle>
            <CardDescription>
              Manage daily meal schedules for your school
            </CardDescription>
          </div>
          <a
            href="https://schools.mealviewer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            MealViewer Reference
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Monthly Calendar
            </TabsTrigger>
            <TabsTrigger value="tags">
              <Tag className="h-4 w-4 mr-1" />
              Dietary Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[150px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!selectedSchool ? (
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a school to manage meals</p>
              </div>
            ) : loadingMeals ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Padding for first week */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-24" />
                ))}
                
                {/* Calendar days */}
                {days.map(day => {
                  const meals = getMealsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "h-24 border rounded-lg p-1 hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden",
                        isToday && "border-primary",
                        !isSameMonth(day, currentMonth) && "opacity-50"
                      )}
                      onClick={() => openAddMealForDate(day)}
                    >
                      <div className={cn(
                        "text-xs font-medium mb-1",
                        isToday && "text-primary"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {meals.slice(0, 2).map(meal => (
                          <div
                            key={meal.id}
                            className="text-xs bg-primary/10 text-primary rounded px-1 truncate flex items-center justify-between group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="truncate">{meal.meal_type}: {meal.menu_items.length} items</span>
                            <button
                              className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                              onClick={() => deleteMeal.mutate(meal.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {meals.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{meals.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Meal Dialog */}
            <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Add Meal for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                  </DialogTitle>
                  <DialogDescription>
                    Add menu items from sources like <a href="https://schools.mealviewer.com/school/610520-51132" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MealViewer</a>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Meal Type</Label>
                    <Select
                      value={newMeal.meal_type}
                      onValueChange={(v) => setNewMeal({ ...newMeal, meal_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Menu Items</Label>
                      <div className="flex gap-2">
                        <MealViewerImport 
                          onImport={(items) => setNewMeal(prev => ({ 
                            ...prev, 
                            items: [...prev.items, ...items.map(i => ({
                              name: i.name,
                              description: i.description || '',
                              calories: i.calories || 0,
                              dietary: i.dietary || []
                            }))] 
                          }))}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addMealItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {newMeal.items.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-3 relative">
                        {newMeal.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeMealItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Item name (e.g., Grilled Chicken)"
                            value={item.name}
                            onChange={(e) => updateMealItem(index, 'name', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Calories"
                            value={item.calories || ''}
                            onChange={(e) => updateMealItem(index, 'calories', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <Textarea
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateMealItem(index, 'description', e.target.value)}
                          rows={2}
                        />
                        <div className="flex flex-wrap gap-1">
                          {dietaryTags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant={item.dietary.includes(tag.name) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              style={item.dietary.includes(tag.name) ? { backgroundColor: tag.color } : {}}
                              onClick={() => {
                                const dietary = item.dietary.includes(tag.name)
                                  ? item.dietary.filter(d => d !== tag.name)
                                  : [...item.dietary, tag.name];
                                updateMealItem(index, 'dietary', dietary);
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => addMeal.mutate(newMeal)}
                    disabled={!newMeal.school_id || !newMeal.items.some(i => i.name.trim()) || addMeal.isPending}
                  >
                    {addMeal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Meal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Dietary Tag</DialogTitle>
                    <DialogDescription>
                      Create a new dietary category like Vegetarian, Vegan, Gluten-Free, etc.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tag Name</Label>
                      <Input
                        placeholder="e.g., Vegetarian, Halal, Kosher"
                        value={newTag.name}
                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewTag({ ...newTag, color })}
                            className={`w-8 h-8 rounded-full transition-all ${
                              newTag.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => addTag.mutate(newTag)}
                      disabled={!newTag.name.trim() || addTag.isPending}
                    >
                      {addTag.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loadingTags ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : dietaryTags.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No dietary tags created yet.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dietaryTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="text-sm py-1 px-3"
                    style={{ backgroundColor: tag.color, color: 'white' }}
                  >
                    {tag.name}
                    <button
                      onClick={() => deleteTag.mutate(tag.id)}
                      className="ml-2 hover:opacity-70"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
