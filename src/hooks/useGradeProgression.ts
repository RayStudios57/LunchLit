import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GRADE_PROGRESSION, GRADE_DISPLAY, GRADE_REVERSION } from '@/config/grades';

// Get the current school year start date (August 1st)
const getSchoolYearStart = (year: number) => new Date(year, 7, 1); // August 1st

// Check if we're in a new school year compared to the last progression
const shouldProgress = (lastProgression: string | null): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Determine the current school year's start
  // If we're before August, the school year started last year
  const schoolYearStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;
  const schoolYearStart = getSchoolYearStart(schoolYearStartYear);
  
  if (!lastProgression) {
    // Never progressed before - check if we're past the start of a school year
    return now >= schoolYearStart;
  }
  
  const lastProgressionDate = new Date(lastProgression);
  
  // Progress if the last progression was before this school year started
  return lastProgressionDate < schoolYearStart && now >= schoolYearStart;
};

export function useGradeProgression() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once per session and when profile is loaded
    if (hasChecked || !profile || profile.is_graduated) return;
    
    const checkAndProgressGrade = async () => {
      const currentGrade = profile.grade_level;
      if (!currentGrade || !GRADE_PROGRESSION[currentGrade]) {
        setHasChecked(true);
        return;
      }

      const lastProgression = profile.last_grade_progression;
      
      if (shouldProgress(lastProgression)) {
        const nextGrade = GRADE_PROGRESSION[currentGrade];
        
        if (nextGrade) {
          // Progress to next grade
          try {
            await updateProfile.mutateAsync({
              grade_level: nextGrade,
              last_grade_progression: new Date().toISOString(),
            });
            
            toast({
              title: `🎉 Welcome to ${GRADE_DISPLAY[nextGrade] || nextGrade}!`,
              description: 'Your grade level has been updated for the new school year.',
            });

            // Send email notification
            sendGradeChangeEmail(user?.email, currentGrade, nextGrade);
          } catch (error) {
            // Silent fail - user can update manually
            console.error('Failed to update grade level:', error);
          }
        } else {
          // Senior graduated!
          try {
            await updateProfile.mutateAsync({
              is_graduated: true,
              last_grade_progression: new Date().toISOString(),
            });
            
            toast({
              title: '🎓 Congratulations, Graduate!',
              description: 'You\'ve completed high school! Your Brag Sheet is ready for college applications.',
            });

            // Send graduation email
            sendGradeChangeEmail(user?.email, currentGrade, null, true);
          } catch (error) {
            console.error('Failed to update graduation status:', error);
          }
        }
      }
      
      setHasChecked(true);
    };

    checkAndProgressGrade();
  }, [profile, hasChecked, updateProfile, toast, user?.email]);

  // Manual grade progression
  const progressGrade = async () => {
    if (!profile?.grade_level) return;
    const nextGrade = GRADE_PROGRESSION[profile.grade_level];
    
    if (nextGrade) {
      await updateProfile.mutateAsync({
        grade_level: nextGrade,
        last_grade_progression: new Date().toISOString(),
      });
      toast({
        title: `Advanced to ${GRADE_DISPLAY[nextGrade] || nextGrade}!`,
      });
    } else {
      // Graduate
      await updateProfile.mutateAsync({
        is_graduated: true,
        last_grade_progression: new Date().toISOString(),
      });
      toast({
        title: '🎓 Congratulations, Graduate!',
      });
    }
  };

  // Revert to previous grade
  const revertGrade = async () => {
    if (!profile?.grade_level) return;
    const previousGrade = GRADE_REVERSION[profile.grade_level];
    
    if (previousGrade) {
      await updateProfile.mutateAsync({
        grade_level: previousGrade,
        is_graduated: false,
      });
      toast({
        title: `Reverted to ${GRADE_DISPLAY[previousGrade] || previousGrade}`,
      });
    } else {
      toast({
        title: 'Cannot revert',
        description: 'You are already at the earliest grade level.',
        variant: 'destructive',
      });
    }
  };

  // Undo graduation
  const undoGraduation = async () => {
    await updateProfile.mutateAsync({
      is_graduated: false,
      grade_level: 'Senior (12th)',
    });
    toast({
      title: 'Graduation undone',
      description: 'You are now a Senior again.',
    });
  };

  return {
    currentGrade: profile?.grade_level,
    isGraduated: profile?.is_graduated,
    nextGrade: profile?.grade_level ? GRADE_PROGRESSION[profile.grade_level] : null,
    previousGrade: profile?.grade_level ? GRADE_REVERSION[profile.grade_level] : null,
    progressGrade,
    revertGrade,
    undoGraduation,
  };
}

// Helper function to send grade change email
async function sendGradeChangeEmail(
  email: string | undefined, 
  fromGrade: string, 
  toGrade: string | null,
  isGraduation: boolean = false
) {
  if (!email) return;
  
  try {
    await supabase.functions.invoke('send-grade-notification', {
      body: { 
        email, 
        fromGrade, 
        toGrade, 
        isGraduation 
      },
    });
  } catch (error) {
    // Silent fail - email is not critical
    console.error('Failed to send grade change email:', error);
  }
}
