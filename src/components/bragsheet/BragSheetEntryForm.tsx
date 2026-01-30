import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBragSheet, BragSheetEntry, BragCategory } from '@/hooks/useBragSheet';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BragSheetImageUpload } from './BragSheetImageUpload';
import { Separator } from '@/components/ui/separator';

const CATEGORIES: { value: BragCategory; label: string }[] = [
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'job', label: 'Work Experience' },
  { value: 'award', label: 'Award / Honor' },
  { value: 'internship', label: 'Internship' },
  { value: 'leadership', label: 'Leadership Role' },
  { value: 'club', label: 'Club / Organization' },
  { value: 'extracurricular', label: 'Extracurricular Activity' },
  { value: 'academic', label: 'Academic Achievement' },
  { value: 'other', label: 'Other' },
];

const GRADE_LEVELS = [
  'Freshman (9th)',
  'Sophomore (10th)',
  'Junior (11th)',
  'Senior (12th)',
];

// Calculate school year based on current date
const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // School year typically starts in August/September
  if (month >= 7) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  category: z.enum(['volunteering', 'job', 'award', 'internship', 'leadership', 'club', 'extracurricular', 'academic', 'other']),
  description: z.string().max(1000).optional(),
  impact: z.string().max(500).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_ongoing: z.boolean().default(false),
  grade_level: z.string().min(1, 'Grade level is required'),
  school_year: z.string().min(1, 'School year is required'),
  hours_spent: z.number().min(0).optional(),
  position_role: z.string().max(200).optional(),
  grades_participated: z.array(z.string()).optional(),
  year_received: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BragSheetEntryFormProps {
  entry?: BragSheetEntry;
  onSuccess: () => void;
  suggestedData?: Partial<FormData>;
}

export function BragSheetEntryForm({ entry, onSuccess, suggestedData }: BragSheetEntryFormProps) {
  const { addEntry, updateEntry } = useBragSheet();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(entry?.images || []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: entry?.title || suggestedData?.title || '',
      category: entry?.category || suggestedData?.category || 'other',
      description: entry?.description || suggestedData?.description || '',
      impact: entry?.impact || suggestedData?.impact || '',
      start_date: entry?.start_date || suggestedData?.start_date || '',
      end_date: entry?.end_date || suggestedData?.end_date || '',
      is_ongoing: entry?.is_ongoing || suggestedData?.is_ongoing || false,
      grade_level: entry?.grade_level || profile?.grade_level || suggestedData?.grade_level || '',
      school_year: entry?.school_year || suggestedData?.school_year || getCurrentSchoolYear(),
      hours_spent: entry?.hours_spent || suggestedData?.hours_spent || undefined,
      position_role: entry?.position_role || '',
      grades_participated: entry?.grades_participated || [],
      year_received: entry?.year_received || '',
      images: entry?.images || [],
    },
  });

  const isOngoing = form.watch('is_ongoing');
  const selectedCategory = form.watch('category');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const entryData = {
        title: data.title,
        category: data.category,
        description: data.description || null,
        impact: data.impact || null,
        start_date: data.start_date || null,
        end_date: data.is_ongoing ? null : (data.end_date || null),
        is_ongoing: data.is_ongoing,
        grade_level: data.grade_level,
        school_year: data.school_year,
        hours_spent: data.hours_spent || null,
        position_role: data.position_role || null,
        grades_participated: data.grades_participated?.length ? data.grades_participated : null,
        year_received: data.year_received || null,
        suggested_from_task_id: null,
        is_auto_suggested: false,
        images: images.length > 0 ? images : null,
      };

      if (entry) {
        await updateEntry.mutateAsync({ id: entry.id, ...entryData });
      } else {
        await addEntry.mutateAsync(entryData);
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Student Council President" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="grade_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade Level *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="school_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Year *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2024-2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your role and responsibilities..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What did you achieve? How did you make a difference?"
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Quantify when possible (e.g., "raised $5,000 for charity")
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isOngoing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_ongoing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>This is ongoing</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Position/Role - shown for activities/leadership/jobs */}
        {['leadership', 'club', 'extracurricular', 'job', 'internship', 'volunteering'].includes(selectedCategory) && (
          <FormField
            control={form.control}
            name="position_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position/Role</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., President, Team Captain, Volunteer Coordinator"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your specific title or role in this activity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Grades Participated - for activities */}
        {['leadership', 'club', 'extracurricular', 'volunteering'].includes(selectedCategory) && (
          <FormField
            control={form.control}
            name="grades_participated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grades Participated</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {GRADE_LEVELS.map((grade) => {
                    const isSelected = field.value?.includes(grade);
                    return (
                      <Button
                        key={grade}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const current = field.value || [];
                          const updated = isSelected
                            ? current.filter(g => g !== grade)
                            : [...current, grade];
                          field.onChange(updated);
                        }}
                      >
                        {grade.split(' ')[0]}
                      </Button>
                    );
                  })}
                </div>
                <FormDescription>
                  Select all grade levels during which you participated
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Year Received - for awards */}
        {selectedCategory === 'award' && (
          <FormField
            control={form.control}
            name="year_received"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Received</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 2024"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="hours_spent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours Spent</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Optional"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Total hours invested in this activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        {/* Image Upload Section */}
        <BragSheetImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={5}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (entry ? 'Update' : 'Add Achievement')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
