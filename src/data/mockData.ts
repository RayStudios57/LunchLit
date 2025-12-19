import { DayMenu, StudyHall } from '@/types';

export const weeklyMenu: DayMenu[] = [
  {
    date: '2024-12-19',
    dayName: 'Thursday',
    items: [
      {
        id: '1',
        name: 'Grilled Chicken Caesar Salad',
        description: 'Fresh romaine lettuce with grilled chicken, parmesan, and caesar dressing',
        dietary: ['gluten-free'],
        calories: 420,
      },
      {
        id: '2',
        name: 'Vegetable Stir Fry',
        description: 'Mixed vegetables with tofu in a savory soy ginger sauce over rice',
        dietary: ['vegan', 'vegetarian'],
        calories: 380,
      },
      {
        id: '3',
        name: 'Pepperoni Pizza',
        description: 'Classic pizza with mozzarella cheese and pepperoni',
        dietary: ['meat', 'dairy'],
        calories: 520,
      },
    ],
  },
  {
    date: '2024-12-20',
    dayName: 'Friday',
    items: [
      {
        id: '4',
        name: 'Fish Tacos',
        description: 'Crispy fish with cabbage slaw and chipotle mayo',
        dietary: ['meat'],
        calories: 450,
      },
      {
        id: '5',
        name: 'Margherita Flatbread',
        description: 'Fresh tomatoes, basil, and mozzarella on flatbread',
        dietary: ['vegetarian', 'dairy'],
        calories: 380,
      },
      {
        id: '6',
        name: 'Buddha Bowl',
        description: 'Quinoa, chickpeas, roasted vegetables with tahini dressing',
        dietary: ['vegan', 'vegetarian', 'gluten-free'],
        calories: 340,
      },
    ],
  },
  {
    date: '2024-12-23',
    dayName: 'Monday',
    items: [
      {
        id: '7',
        name: 'BBQ Pulled Pork Sandwich',
        description: 'Slow-cooked pulled pork with coleslaw on a brioche bun',
        dietary: ['meat'],
        calories: 580,
      },
      {
        id: '8',
        name: 'Caprese Panini',
        description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
        dietary: ['vegetarian', 'dairy'],
        calories: 420,
      },
      {
        id: '9',
        name: 'Falafel Wrap',
        description: 'Crispy falafel with hummus, vegetables in a whole wheat wrap',
        dietary: ['vegan', 'vegetarian'],
        calories: 390,
      },
    ],
  },
];

export const studyHalls: StudyHall[] = [
  {
    id: '1',
    name: 'Library Study Hall',
    location: 'Main Library, 2nd Floor',
    teacher: 'Mrs. Thompson',
    capacity: 30,
    currentOccupancy: 12,
    available: true,
    periods: ['Period 3', 'Period 5', 'Period 7'],
  },
  {
    id: '2',
    name: 'Science Wing Study',
    location: 'Room 204',
    teacher: 'Mr. Garcia',
    capacity: 25,
    currentOccupancy: 25,
    available: false,
    periods: ['Period 2', 'Period 4'],
  },
  {
    id: '3',
    name: 'Quiet Study Room',
    location: 'Media Center',
    teacher: 'Ms. Chen',
    capacity: 15,
    currentOccupancy: 8,
    available: true,
    periods: ['Period 1', 'Period 3', 'Period 6'],
  },
  {
    id: '4',
    name: 'Commons Area',
    location: 'Student Commons',
    teacher: 'Mr. Johnson',
    capacity: 50,
    currentOccupancy: 32,
    available: true,
    periods: ['All Periods'],
  },
  {
    id: '5',
    name: 'Math Tutoring Lab',
    location: 'Room 112',
    teacher: 'Mrs. Patel',
    capacity: 20,
    currentOccupancy: 18,
    available: true,
    periods: ['Period 4', 'Period 5'],
  },
];

export const getTodayMenu = (): DayMenu => {
  return weeklyMenu[0]; // Return first item as "today"
};
