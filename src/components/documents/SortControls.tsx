import { Button } from '@/components/ui/button';
import { SortField, SortOrder } from '@/utils/documentUtils';

interface SortControlsProps {
  field: SortField;
  order: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
}

export function SortControls({ field, order, onSort }: SortControlsProps) {
  const sortOptions: { label: string; value: SortField }[] = [
    { label: 'Title', value: 'title' },
    { label: 'Date', value: 'created_at' },
    { label: 'Type', value: 'document_type' },
    { label: 'Status', value: 'status' }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Sort by:</span>
      <div className="flex gap-1">
        {sortOptions.map(({ label, value }) => (
          <Button
            key={value}
            variant={field === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSort(
              value,
              field === value && order === 'asc' ? 'desc' : 'asc'
            )}
            className="flex items-center gap-1"
          >
            {label}
            {field === value && (
              <span className="ml-1">
                {order === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
