import { useState } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/button';

export interface DocumentFilters {
  searchTerm: string;
  documentType: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface DocumentSearchProps {
  onSearch: (filters: DocumentFilters) => void;
  onReset: () => void;
}

export function DocumentSearch({ onSearch, onReset }: DocumentSearchProps) {
  const [filters, setFilters] = useState<DocumentFilters>({
    searchTerm: '',
    documentType: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      documentType: '',
      status: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
    onReset();
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex gap-4">
        <TextField
          placeholder="Search documents..."
          value={filters.searchTerm}
          onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          className="flex-1"
        />
        <Button type="submit">
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filters.documentType}
          onChange={e => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
          className="w-full p-2 border rounded"
        >
          <option value="">All Document Types</option>
          <option value="legal_brief">Legal Brief</option>
          <option value="motion">Motion</option>
          <option value="pleading">Pleading</option>
          <option value="contract">Contract</option>
          <option value="correspondence">Correspondence</option>
          <option value="evidence">Evidence</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="w-full p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Under Review</option>
          <option value="final">Final</option>
          <option value="archived">Archived</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={e => setFilters(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, start: e.target.value }
            }))}
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={e => setFilters(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, end: e.target.value }
            }))}
            className="w-1/2 p-2 border rounded"
          />
        </div>
      </div>
    </form>
  );
}
