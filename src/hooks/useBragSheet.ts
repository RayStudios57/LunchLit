import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type BragCategory = 
  | 'volunteering' 
  | 'job' 
  | 'award' 
  | 'internship' 
  | 'leadership' 
  | 'club' 
  | 'extracurricular' 
  | 'academic' 
  | 'other';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface BragSheetEntry {
  id: string;
  user_id: string;
  title: string;
  category: BragCategory;
  description: string | null;
  impact: string | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  grade_level: string;
  school_year: string;
  hours_spent: number | null;
  position_role: string | null;
  grades_participated: string[] | null;
  year_received: string | null;
  verification_status: VerificationStatus;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  suggested_from_task_id: string | null;
  is_auto_suggested: boolean;
  created_at: string;
  updated_at: string;
}

export type BragSheetEntryInsert = Omit<BragSheetEntry, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified_by' | 'verified_at' | 'verification_notes' | 'verification_status'>;

export function useBragSheet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['brag-sheet', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data as BragSheetEntry[];
    },
    enabled: !!user,
  });

  const addEntry = useMutation({
    mutationFn: async (entry: BragSheetEntryInsert) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .insert({ ...entry, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brag-sheet'] });
      toast({ title: 'Achievement added to your Brag Sheet!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding entry', description: error.message, variant: 'destructive' });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BragSheetEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('brag_sheet_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brag-sheet'] });
      toast({ title: 'Entry updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating entry', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('brag_sheet_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brag-sheet'] });
      toast({ title: 'Entry removed from Brag Sheet' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting entry', description: error.message, variant: 'destructive' });
    },
  });

  // Group entries by school year
  const entriesByYear = entries.reduce((acc, entry) => {
    const year = entry.school_year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {} as Record<string, BragSheetEntry[]>);

  // Get stats
  const stats = {
    total: entries.length,
    verified: entries.filter(e => e.verification_status === 'verified').length,
    totalHours: entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0),
    byCategory: entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<BragCategory, number>),
  };

  return { 
    entries, 
    entriesByYear, 
    stats, 
    isLoading, 
    addEntry, 
    updateEntry, 
    deleteEntry 
  };
}
