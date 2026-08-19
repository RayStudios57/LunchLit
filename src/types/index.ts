export type DietaryType = 'vegetarian' | 'vegan' | 'dairy' | 'meat' | 'gluten-free' | 'halal';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  dietary: DietaryType[];
  calories?: number;
  image?: string;
}

export interface DayMenu {
  date: string;
  dayName: string;
  items: MenuItem[];
}

export interface StudyHall {
  id: string;
  name: string;
  location: string;
  teacher: string;
  capacity: number;
  currentOccupancy: number;
  available: boolean;
  periods: string[];
}
