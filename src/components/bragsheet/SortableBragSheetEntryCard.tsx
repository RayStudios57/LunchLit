import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BragSheetEntry } from '@/hooks/useBragSheet';
import { BragSheetEntryCard } from './BragSheetEntryCard';
import { GripVertical } from 'lucide-react';

interface SortableBragSheetEntryCardProps {
  entry: BragSheetEntry;
  isDraggable?: boolean;
}

export function SortableBragSheetEntryCard({ entry, isDraggable = true }: SortableBragSheetEntryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!isDraggable) {
    return <BragSheetEntryCard entry={entry} />;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <BragSheetEntryCard entry={entry} />
    </div>
  );
}
