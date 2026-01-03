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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Utensils, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  menu_items: any[];
}

export function AdminMealManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#10b981' });
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [newMeal, setNewMeal] = useState({
    school_id: '',
    meal_date: new Date().toISOString().split('T')[0],
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

  const { data: mealSchedules = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['admin-meals', selectedSchool],
    queryFn: async () => {
      let query = supabase
        .from('meal_schedules')
        .select('*')
        .order('meal_date', { ascending: false })
        .limit(50);
      
      if (selectedSchool) {
        query = query.eq('school_id', selectedSchool);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MealSchedule[];
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
      queryClient.invalidateQueries({ queryKey: ['admin-meals'] });
      toast({ title: 'Meal schedule added' });
      setIsAddMealOpen(false);
      setNewMeal({
        school_id: '',
        meal_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        items: [{ name: '', description: '', calories: 0, dietary: [] }],
      });
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
      queryClient.invalidateQueries({ queryKey: ['admin-meals'] });
      toast({ title: 'Meal deleted' });
    },
  });

  const addMealItem = () => {
    setNewMeal(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', calories: 0, dietary: [] }],
    }));
  };

  const updateMealItem = (index: number, field: string, value: any) => {
    setNewMeal(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Meal Management
        </CardTitle>
        <CardDescription>
          Manage dietary tags and meal schedules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tags">
          <TabsList className="mb-4">
            <TabsTrigger value="tags">
              <Tag className="h-4 w-4 mr-1" />
              Dietary Tags
            </TabsTrigger>
            <TabsTrigger value="meals">
              <Utensils className="h-4 w-4 mr-1" />
              Meal Schedules
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="meals" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Meal Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Meal Schedule</DialogTitle>
                    <DialogDescription>
                      Create a new meal schedule for a school.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>School</Label>
                        <Select
                          value={newMeal.school_id}
                          onValueChange={(v) => setNewMeal({ ...newMeal, school_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newMeal.meal_date}
                          onChange={(e) => setNewMeal({ ...newMeal, meal_date: e.target.value })}
                        />
                      </div>
                    </div>

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
                        <Button type="button" variant="outline" size="sm" onClick={addMealItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>

                      {newMeal.items.map((item, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Item name"
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
                            placeholder="Description (hover text)"
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
                      Add Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loadingMeals ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : mealSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No meal schedules found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealSchedules.map((meal) => (
                    <TableRow key={meal.id}>
                      <TableCell>{new Date(meal.meal_date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{meal.meal_type}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {meal.menu_items?.slice(0, 3).map((item: any, i: number) => (
                            <Badge key={i} variant="secondary">{item.name}</Badge>
                          ))}
                          {meal.menu_items?.length > 3 && (
                            <Badge variant="outline">+{meal.menu_items.length - 3} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Meal Schedule?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this meal schedule.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMeal.mutate(meal.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}