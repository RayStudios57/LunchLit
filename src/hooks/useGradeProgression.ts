import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const GRADE_PROGRESSION: Record<string, string | null> = {
  'Freshman (9th)': 'Sophomore (10th)',
  'Sophomore (10th)': 'Junior (11th)',
  'Junior (11th)': 'Senior (12th)',
  'Senior (12th)': null, // Graduation
};

const GRADE_DISPLAY: Record<string, string> = {
  'Freshman (9th)': 'Freshman',
  'Sophomore (10th)': 'Sophomore',
  'Junior (11th)': 'Junior',
  'Senior (12th)': 'Senior',
};

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
          } catch (error) {
            console.error('Failed to update graduation status:', error);
          }
        }
      }
      
      setHasChecked(true);
    };

    checkAndProgressGrade();
  }, [profile, hasChecked, updateProfile, toast]);

  return {
    currentGrade: profile?.grade_level,
    isGraduated: profile?.is_graduated,
    nextGrade: profile?.grade_level ? GRADE_PROGRESSION[profile.grade_level] : null,
  };
}
