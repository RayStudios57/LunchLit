import { useState } from 'react';
import { useClassSchedule, ClassSchedule as ClassScheduleType } from '@/hooks/useClassSchedule';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Clock, MapPin, User, Sparkles, CalendarDays, RotateCw } from 'lucide-react';
import { RotationSettingsDialog } from './RotationSettingsDialog';
import { isRotationEnabled, getRotationLetter, classMatchesRotation } from '@/lib/rotation';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'
];

export function ClassSchedule() {
  const { classes, isLoading, addClass, deleteClass } = useClassSchedule();
  const { preferences } = useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [rotationOpen, setRotationOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | 'all'>(1); // Monday or all
  
  const rotationActive = isRotationEnabled(preferences);

  const [newClass, setNewClass] = useState({
    class_name: '',
    teacher_name: '',
    room_number: '',
    day_of_week: 1,
    start_time: '08:00',
    end_time: '09:00',
    color: COLORS[0],
    is_club: false,
    show_every_day: false,
    rotation_day: 'all' as 'all' | 'A' | 'B',
  });

  const handleAddClass = () => {
    if (!newClass.class_name.trim()) return;
    addClass.mutate(newClass);
    setNewClass({
      class_name: '',
      teacher_name: '',
      room_number: '',
      day_of_week: 1,
      start_time: '08:00',
      end_time: '09:00',
      color: COLORS[0],
      is_club: false,
      show_every_day: false,
      rotation_day: 'all',
    });
    setIsOpen(false);
  };

  const getWeekdayDate = (dayIndex: number): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const currentDay = d.getDay();
    const diff = dayIndex - currentDay;
    const target = new Date(d);
    target.setDate(d.getDate() + diff);
    return target;
  };

  const classesForDay = (day: number | 'all') => {
    if (day === 'all') {
      // Group by day for all-days view
      return classes.sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        return a.start_time.localeCompare(b.start_time);
      });
    }
    
    const targetDate = getWeekdayDate(day);
    return classes
      .filter(c => (c.day_of_week === day || (c as any).show_every_day) && classMatchesRotation(c.rotation_day, targetDate, preferences))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const today = new Date().getDay();
  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday

  return (
    <>
      <Card className="card-elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="font-display flex items-center gap-2">
              <span className="text-xl">📅</span>
              Class Schedule
            </CardTitle>
            {rotationActive && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                A/B Rotation On
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotationOpen(true)}
              className="gap-1.5"
            >
              <RotateCw className="h-4 w-4 text-primary" />
              Rotation
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Class Name</Label>
                    <Input
                      placeholder="e.g., Math 101"
                      value={newClass.class_name}
                      onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-club"
                      checked={newClass.is_club}
                      onCheckedChange={(checked) => setNewClass({ ...newClass, is_club: checked })}
                    />
                    <Label htmlFor="is-club" className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      This is a Club/Activity
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-every-day"
                      checked={newClass.show_every_day}
                      onCheckedChange={(checked) => setNewClass({ ...newClass, show_every_day: checked })}
                    />
                    <Label htmlFor="show-every-day" className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      Show Every Day
                    </Label>
                  </div>

                  {rotationActive && (
                    <div className="space-y-2">
                      <Label>Rotation Day</Label>
                      <Select
                        value={newClass.rotation_day}
                        onValueChange={(v) => setNewClass({ ...newClass, rotation_day: v as 'all' | 'A' | 'B' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Every Day / Both Days</SelectItem>
                          <SelectItem value="A">🅰️ A Day Only</SelectItem>
                          <SelectItem value="B">🅱️ B Day Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teacher</Label>
                      <Input
                        placeholder="Mr. Smith"
                        value={newClass.teacher_name}
                        onChange={(e) => setNewClass({ ...newClass, teacher_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Room</Label>
                      <Input
                        placeholder="Room 101"
                        value={newClass.room_number}
                        onChange={(e) => setNewClass({ ...newClass, room_number: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  {!newClass.show_every_day && (
                    <div className="space-y-2">
                      <Label>Day</Label>
                      <Select 
                        value={String(newClass.day_of_week)} 
                        onValueChange={(v) => setNewClass({ ...newClass, day_of_week: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day, i) => (
                            <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newClass.start_time}
                        onChange={(e) => setNewClass({ ...newClass, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newClass.end_time}
                        onChange={(e) => setNewClass({ ...newClass, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewClass({ ...newClass, color })}
                          className={`w-8 h-8 rounded-full transition-all ${
                            newClass.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddClass} className="w-full" disabled={!newClass.class_name.trim()}>
                    Add Class
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
          ) : (
            <div className="space-y-4">
              {/* Day tabs with All Days option and computed rotation letters */}
              <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setSelectedDay('all')}
                  className={`min-w-[60px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === 'all'
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CalendarDays className="h-4 w-4 mx-auto sm:hidden" />
                  <span className="hidden sm:inline">All Days</span>
                </button>
                {weekdays.map((day) => {
                  const letter = rotationActive ? getRotationLetter(getWeekdayDate(day), preferences) : null;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDay === day
                          ? 'bg-card text-foreground shadow-card'
                          : 'text-muted-foreground hover:text-foreground'
                      } ${today === day ? 'ring-2 ring-primary/30' : ''}`}
                    >
                      <span className="hidden sm:inline">
                        {DAYS[day]}
                        {letter ? ` (${letter})` : ''}
                      </span>
                      <span className="sm:hidden">
                        {DAYS[day].slice(0, 3)}
                        {letter ? ` (${letter})` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Classes view */}
              <div className="space-y-2 min-h-[200px]">
                {selectedDay === 'all' ? (
                  // All days view - grouped by day
                  weekdays.map(day => {
                    const targetDate = getWeekdayDate(day);
                    const letter = rotationActive ? getRotationLetter(targetDate, preferences) : null;
                    const dayClasses = classes.filter(c => (c.day_of_week === day || (c as any).show_every_day) && classMatchesRotation(c.rotation_day, targetDate, preferences));
                    if (dayClasses.length === 0) return null;
                    
                    return (
                      <div key={day} className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground border-b pb-1 flex items-center justify-between">
                          <span>{DAYS[day]}</span>
                          {letter && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {letter} Day
                            </Badge>
                          )}
                        </h3>
                        {dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((cls) => (
                          <ClassCard key={`${day}-${cls.id}`} cls={cls} onDelete={() => deleteClass.mutate(cls.id)} />
                        ))}
                      </div>
                    );
                  })
                ) : (
                  // Single day view
                  classesForDay(selectedDay).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No classes on {DAYS[selectedDay as number]}</p>
                    </div>
                  ) : (
                    classesForDay(selectedDay).map((cls) => (
                      <ClassCard key={cls.id} cls={cls} onDelete={() => deleteClass.mutate(cls.id)} />
                    ))
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RotationSettingsDialog
        open={rotationOpen}
        onOpenChange={setRotationOpen}
      />
    </>
  );
}

function ClassCard({ cls, onDelete }: { cls: any; onDelete: () => void }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
      style={{ borderLeftWidth: 4, borderLeftColor: cls.color }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium">{cls.class_name}</p>
          {cls.rotation_day && cls.rotation_day !== 'all' && (
            <Badge
              variant="secondary"
              className={`text-xs font-bold ${
                cls.rotation_day === 'A'
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-accent text-accent-foreground border-accent-foreground/20'
              }`}
            >
              {cls.rotation_day === 'A' ? '🅰️ A Day' : '🅱️ B Day'}
            </Badge>
          )}
          {cls.is_club && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
              Club
            </Badge>
          )}
          {cls.show_every_day && (
            <Badge variant="secondary" className="text-xs">
              Daily
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
          </span>
          {cls.teacher_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {cls.teacher_name}
            </span>
          )}
          {cls.room_number && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {cls.room_number}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}