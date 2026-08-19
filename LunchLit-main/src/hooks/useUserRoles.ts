import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'teacher' | 'counselor' | 'student';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  school_id: string | null;
  email_domain: string | null;
  created_at: string;
}

// Known educational email domains
const EDUCATIONAL_DOMAINS = [
  '.edu',
  '.k12.',
  '.school',
  '.ac.',
  'teachers.',
  'faculty.',
];

export function isEducationalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return EDUCATIONAL_DOMAINS.some(ed => domain.includes(ed));
}

export function useUserRoles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!user,
  });

  const isVerifier = roles.some(r => r.role === 'teacher' || r.role === 'counselor');
  const isAdmin = roles.some(r => r.role === 'admin');

  const requestVerifierRole = useMutation({
    mutationFn: async ({ role, schoolId }: { role: 'teacher' | 'counselor'; schoolId: string }) => {
      if (!user?.email) throw new Error('Not authenticated');
      
      // Check if email is educational
      if (!isEducationalEmail(user.email)) {
        throw new Error('Please use a school email address (.edu, .k12, etc.) to register as a verifier');
      }

      const emailDomain = user.email.split('@')[1];
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role,
          school_id: schoolId,
          email_domain: emailDomain,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({ 
        title: 'Role assigned!', 
        description: `You are now registered as a ${variables.role}` 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error requesting role', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return { 
    roles, 
    isLoading, 
    isVerifier, 
    isAdmin,
    requestVerifierRole 
  };
}
