// Shared grade level configuration used across the app
export const GRADE_OPTIONS = [
  { value: '5th Grade', label: '5th Grade', emoji: '📚', order: 1 },
  { value: '6th Grade', label: '6th Grade', emoji: '📖', order: 2 },
  { value: '7th Grade', label: '7th Grade', emoji: '📝', order: 3 },
  { value: '8th Grade', label: '8th Grade', emoji: '🎒', order: 4 },
  { value: 'Freshman (9th)', label: 'Freshman (9th)', emoji: '🌟', order: 5 },
  { value: 'Sophomore (10th)', label: 'Sophomore (10th)', emoji: '📝', order: 6 },
  { value: 'Junior (11th)', label: 'Junior (11th)', emoji: '🎯', order: 7 },
  { value: 'Senior (12th)', label: 'Senior (12th)', emoji: '🎓', order: 8 },
];

// Grade progression map - what grade comes next
export const GRADE_PROGRESSION: Record<string, string | null> = {
  '5th Grade': '6th Grade',
  '6th Grade': '7th Grade',
  '7th Grade': '8th Grade',
  '8th Grade': 'Freshman (9th)',
  'Freshman (9th)': 'Sophomore (10th)',
  'Sophomore (10th)': 'Junior (11th)',
  'Junior (11th)': 'Senior (12th)',
  'Senior (12th)': null, // Graduation
};

// Get previous grade for reversion
export const GRADE_REVERSION: Record<string, string | null> = {
  '6th Grade': '5th Grade',
  '7th Grade': '6th Grade',
  '8th Grade': '7th Grade',
  'Freshman (9th)': '8th Grade',
  'Sophomore (10th)': 'Freshman (9th)',
  'Junior (11th)': 'Sophomore (10th)',
  'Senior (12th)': 'Junior (11th)',
};

export const GRADE_DISPLAY: Record<string, string> = {
  '5th Grade': '5th Grade',
  '6th Grade': '6th Grade',
  '7th Grade': '7th Grade',
  '8th Grade': '8th Grade',
  'Freshman (9th)': 'Freshman',
  'Sophomore (10th)': 'Sophomore',
  'Junior (11th)': 'Junior',
  'Senior (12th)': 'Senior',
};

export const isHighSchool = (grade: string | null | undefined): boolean => {
  if (!grade) return false;
  return ['Freshman (9th)', 'Sophomore (10th)', 'Junior (11th)', 'Senior (12th)'].includes(grade);
};

export const getGradeOrder = (grade: string | null | undefined): number => {
  const option = GRADE_OPTIONS.find(g => g.value === grade);
  return option?.order ?? 0;
};
