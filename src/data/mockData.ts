import { DayMenu, StudyHall } from '@/types';
import { format, addDays, startOfWeek, isWeekend, isSameDay } from 'date-fns';

// Generate dynamic menu based on current date
const generateWeeklyMenu = (): DayMenu[] => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  
  const menuItems: import('@/types').MenuItem[][] = [
    [
      { id: '1', name: 'Grilled Chicken Caesar Salad', description: 'Fresh romaine lettuce with grilled chicken, parmesan, and caesar dressing', dietary: ['gluten-free'], calories: 420, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop' },
      { id: '2', name: 'Vegetable Stir Fry', description: 'Mixed vegetables with tofu in a savory soy ginger sauce over rice', dietary: ['vegan', 'vegetarian'], calories: 380, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop' },
      { id: '3', name: 'Cheese Pizza', description: 'Classic pizza with melted mozzarella and parmesan cheese', dietary: ['vegetarian', 'dairy'], calories: 480, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop' },
    ],
    [
      { id: '4', name: 'Fish Tacos', description: 'Crispy fish with cabbage slaw and chipotle mayo', dietary: ['gluten-free'], calories: 450, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop' },
      { id: '5', name: 'Margherita Flatbread', description: 'Fresh tomatoes, basil, and mozzarella on flatbread', dietary: ['vegetarian', 'dairy'], calories: 380, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
      { id: '6', name: 'Buddha Bowl', description: 'Quinoa, chickpeas, roasted vegetables with tahini dressing', dietary: ['vegan', 'vegetarian', 'gluten-free'], calories: 340, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
    ],
    [
      { id: '7', name: 'BBQ Pulled Pork Sandwich', description: 'Slow-cooked pulled pork with coleslaw on a brioche bun', dietary: ['meat'], calories: 580, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop' },
      { id: '8', name: 'Caprese Panini', description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze', dietary: ['vegetarian', 'dairy'], calories: 420, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
      { id: '9', name: 'Falafel Wrap', description: 'Crispy falafel with hummus, vegetables in a whole wheat wrap', dietary: ['vegan', 'vegetarian'], calories: 390, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop' },
    ],
    [
      { id: '10', name: 'Chicken Alfredo Pasta', description: 'Creamy alfredo sauce with grilled chicken over penne', dietary: ['dairy'], calories: 520, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop' },
      { id: '11', name: 'Garden Salad Bar', description: 'Fresh greens with a variety of toppings and dressings', dietary: ['vegan', 'vegetarian', 'gluten-free'], calories: 280, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
      { id: '12', name: 'Beef Burrito Bowl', description: 'Seasoned beef with rice, beans, and fresh salsa', dietary: ['gluten-free'], calories: 490, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
    ],
    [
      { id: '13', name: 'Crispy Chicken Tenders', description: 'Golden fried chicken tenders with dipping sauces', dietary: ['meat'], calories: 450, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop' },
      { id: '14', name: 'Veggie Burger', description: 'Plant-based patty with all the fixings on a whole wheat bun', dietary: ['vegan', 'vegetarian'], calories: 380, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop' },
      { id: '15', name: 'Soup & Sandwich Combo', description: 'Tomato soup with a grilled cheese sandwich', dietary: ['vegetarian', 'dairy'], calories: 420, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop' },
    ],
  ];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const menus: DayMenu[] = [];

  for (let i = 0; i < 5; i++) {
    const date = addDays(weekStart, i);
    menus.push({
      date: format(date, 'yyyy-MM-dd'),
      dayName: dayNames[i],
      items: menuItems[i],
    });
  }

  return menus;
};

export const weeklyMenu: DayMenu[] = generateWeeklyMenu();

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
  const today = new Date();
  
  // If weekend, show Monday's menu
  if (isWeekend(today)) {
    return weeklyMenu[0];
  }
  
  // Find today's menu
  const todayMenu = weeklyMenu.find(menu => 
    isSameDay(new Date(menu.date), today)
  );
  
  return todayMenu || weeklyMenu[0];
};
