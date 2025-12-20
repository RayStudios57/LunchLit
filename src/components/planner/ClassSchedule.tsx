import { useState } from 'react';
import { useClassSchedule, ClassSchedule as ClassScheduleType } from '@/hooks/useClassSchedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'
];

export function ClassSchedule() {
  const { classes, isLoading, addClass, deleteClass } = useClassSchedule();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  
  const [newClass, setNewClass] = useState({
    class_name: '',
    teacher_name: '',
    room_number: '',
    day_of_week: 1,
    start_time: '08:00',
    end_time: '09:00',
    color: COLORS[0],
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
    });
    setIsOpen(false);
  };

  const classesForDay = (day: number) => 
    classes.filter(c => c.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const today = new Date().getDay();
  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday

  return (
    <Card className="card-elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display flex items-center gap-2">
          <span className="text-xl">📅</span>
          Class Schedule
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
        ) : (
          <div className="space-y-4">
            {/* Day tabs */}
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl overflow-x-auto">
              {weekdays.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[60px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === day
                      ? 'bg-card text-foreground shadow-card'
                      : 'text-muted-foreground hover:text-foreground'
                  } ${today === day ? 'ring-2 ring-primary/30' : ''}`}
                >
                  <span className="hidden sm:inline">{DAYS[day]}</span>
                  <span className="sm:hidden">{DAYS[day].slice(0, 3)}</span>
                </button>
              ))}
            </div>

            {/* Classes for selected day */}
            <div className="space-y-2 min-h-[200px]">
              {classesForDay(selectedDay).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No classes on {DAYS[selectedDay]}</p>
                </div>
              ) : (
                classesForDay(selectedDay).map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
                    style={{ borderLeftWidth: 4, borderLeftColor: cls.color }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{cls.class_name}</p>
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
                      onClick={() => deleteClass.mutate(cls.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
