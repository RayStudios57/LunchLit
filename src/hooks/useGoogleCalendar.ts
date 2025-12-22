import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import { useClassSchedule } from '@/hooks/useClassSchedule';
import { format, addDays, startOfWeek, nextMonday } from 'date-fns';

export function useGoogleCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tasks } = useTasks();
  const { classes } = useClassSchedule();
  const [isExporting, setIsExporting] = useState(false);

  const generateICSContent = useCallback(() => {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LunchLit//Student Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    // Add tasks as events
    tasks.forEach((task) => {
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const dateStr = format(dueDate, 'yyyyMMdd');
        
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:task-${task.id}@lunchlit.app`);
        lines.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
        lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
        lines.push(`DTEND;VALUE=DATE:${dateStr}`);
        lines.push(`SUMMARY:${task.title}`);
        lines.push(`DESCRIPTION:Category: ${task.category}\\nPriority: ${task.priority}${task.description ? '\\n' + task.description : ''}`);
        lines.push(`STATUS:${task.is_completed ? 'COMPLETED' : 'NEEDS-ACTION'}`);
        lines.push('END:VEVENT');
      }
    });

    // Add classes as recurring events (for next 4 weeks starting from next Monday)
    const weekStart = nextMonday(new Date());
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    classes.forEach((cls) => {
      // Calculate the date for this class in the coming week
      const classDate = addDays(weekStart, (cls.day_of_week === 0 ? 6 : cls.day_of_week - 1));
      const startDateTime = `${format(classDate, 'yyyyMMdd')}T${cls.start_time.replace(/:/g, '')}00`;
      const endDateTime = `${format(classDate, 'yyyyMMdd')}T${cls.end_time.replace(/:/g, '')}00`;
      
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:class-${cls.id}@lunchlit.app`);
      lines.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
      lines.push(`DTSTART:${startDateTime}`);
      lines.push(`DTEND:${endDateTime}`);
      lines.push(`SUMMARY:${cls.class_name}`);
      lines.push(`DESCRIPTION:${dayNames[cls.day_of_week]}${cls.teacher_name ? '\\nTeacher: ' + cls.teacher_name : ''}${cls.room_number ? '\\nRoom: ' + cls.room_number : ''}`);
      lines.push('RRULE:FREQ=WEEKLY;COUNT=16'); // Repeat for ~4 months
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }, [tasks, classes]);

  const exportToCalendar = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to export your calendar.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const icsContent = generateICSContent();
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `lunchlit-calendar-${format(new Date(), 'yyyy-MM-dd')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Calendar exported!',
        description: 'Import the .ics file into Google Calendar, Apple Calendar, or Outlook.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Unable to export calendar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [user, generateICSContent, toast]);

  const openGoogleCalendarImport = useCallback(() => {
    // Open Google Calendar import page
    window.open('https://calendar.google.com/calendar/r/settings/export', '_blank');
  }, []);

  return {
    exportToCalendar,
    openGoogleCalendarImport,
    isExporting,
    hasEvents: tasks.length > 0 || classes.length > 0,
  };
}
