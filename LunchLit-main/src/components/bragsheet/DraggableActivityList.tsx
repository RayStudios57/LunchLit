import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BragSheetEntry } from '@/hooks/useBragSheet';
import { SortableBragSheetEntryCard } from './SortableBragSheetEntryCard';
import { useToast } from '@/hooks/use-toast';

interface DraggableActivityListProps {
  entries: BragSheetEntry[];
  onReorder?: (orderedIds: string[]) => void;
}

export function DraggableActivityList({ entries, onReorder }: DraggableActivityListProps) {
  const [items, setItems] = useState(entries);
  const { toast } = useToast();

  // Update items when entries change
  if (entries.length !== items.length || entries.some((e, i) => e.id !== items[i]?.id)) {
    setItems(entries);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(currentItems, oldIndex, newIndex);
        
        // Notify parent of reorder
        if (onReorder) {
          onReorder(newItems.map(item => item.id));
        }

        toast({
          title: 'Activities reordered',
          description: 'Drag activities to prioritize your most important ones first.',
        });

        return newItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 pl-6">
          {items.map((entry) => (
            <SortableBragSheetEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
