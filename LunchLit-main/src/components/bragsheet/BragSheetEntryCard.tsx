import { useState } from 'react';
import { BragSheetEntry, useBragSheet, BragCategory } from '@/hooks/useBragSheet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { 
  Pencil, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Award,
  Users,
  Heart,
  GraduationCap,
  Star,
  Trophy,
  MoreHorizontal,
  ImageIcon
} from 'lucide-react';
import { BragSheetEntryForm } from './BragSheetEntryForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const categoryConfig: Record<BragCategory, { label: string; icon: React.ElementType; color: string }> = {
  volunteering: { label: 'Volunteering', icon: Heart, color: 'bg-pink-500/10 text-pink-600' },
  job: { label: 'Work Experience', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600' },
  award: { label: 'Award', icon: Award, color: 'bg-yellow-500/10 text-yellow-600' },
  internship: { label: 'Internship', icon: GraduationCap, color: 'bg-purple-500/10 text-purple-600' },
  leadership: { label: 'Leadership', icon: Star, color: 'bg-orange-500/10 text-orange-600' },
  club: { label: 'Club', icon: Users, color: 'bg-green-500/10 text-green-600' },
  extracurricular: { label: 'Extracurricular', icon: Trophy, color: 'bg-indigo-500/10 text-indigo-600' },
  academic: { label: 'Academic', icon: GraduationCap, color: 'bg-cyan-500/10 text-cyan-600' },
  other: { label: 'Other', icon: Star, color: 'bg-gray-500/10 text-gray-600' },
};

interface BragSheetEntryCardProps {
  entry: BragSheetEntry;
}

export function BragSheetEntryCard({ entry }: BragSheetEntryCardProps) {
  const { deleteEntry } = useBragSheet();
  const [isEditing, setIsEditing] = useState(false);
  
  const config = categoryConfig[entry.category];
  const CategoryIcon = config.icon;
  
  const formatDateRange = () => {
    if (!entry.start_date) return null;
    const start = format(new Date(entry.start_date), 'MMM yyyy');
    if (entry.is_ongoing) return `${start} - Present`;
    if (!entry.end_date) return start;
    const end = format(new Date(entry.end_date), 'MMM yyyy');
    return start === end ? start : `${start} - ${end}`;
  };

  const getVerificationBadge = () => {
    switch (entry.verification_status) {
      case 'verified':
        return (
          <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="w-3 h-3" />
            Needs Review
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.color} shrink-0`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium leading-tight">{entry.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{entry.grade_level}</span>
                    {formatDateRange() && (
                      <span className="text-xs text-muted-foreground">• {formatDateRange()}</span>
                    )}
                    {entry.hours_spent && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.hours_spent}h
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {getVerificationBadge()}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this achievement?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove "{entry.title}" from your Brag Sheet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEntry.mutate(entry.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {entry.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {entry.description}
                </p>
              )}
              
              {entry.impact && (
                <p className="text-sm mt-2">
                  <span className="font-medium text-primary">Impact: </span>
                  {entry.impact}
                </p>
              )}

              {/* Display images if present */}
              {entry.images && entry.images.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-muted-foreground" />
                  <div className="flex gap-1">
                    {entry.images.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${entry.title} image ${idx + 1}`}
                        className="w-8 h-8 rounded object-cover border"
                      />
                    ))}
                    {entry.images.length > 3 && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        +{entry.images.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          <BragSheetEntryForm 
            entry={entry} 
            onSuccess={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
