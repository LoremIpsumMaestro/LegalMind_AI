import { Document } from '@/hooks/useDocuments';

export type SortField = 'title' | 'created_at' | 'document_type' | 'status';
export type SortOrder = 'asc' | 'desc';

export function sortDocuments(
  documents: Document[],
  field: SortField,
  order: SortOrder
): Document[] {
  return [...documents].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'document_type':
        comparison = a.document_type.localeCompare(b.document_type);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

export function groupDocumentsByType(documents: Document[]): Record<string, Document[]> {
  return documents.reduce((groups, doc) => {
    const type = doc.document_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);
}

export function groupDocumentsByStatus(documents: Document[]): Record<string, Document[]> {
  return documents.reduce((groups, doc) => {
    const status = doc.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);
}

export function getDocumentStats(documents: Document[]) {
  const totalDocuments = documents.length;
  const byType = groupDocumentsByType(documents);
  const byStatus = groupDocumentsByStatus(documents);

  const stats = {
    total: totalDocuments,
    byType: Object.entries(byType).map(([type, docs]) => ({
      type,
      count: docs.length,
      percentage: (docs.length / totalDocuments) * 100
    })),
    byStatus: Object.entries(byStatus).map(([status, docs]) => ({
      status,
      count: docs.length,
      percentage: (docs.length / totalDocuments) * 100
    })),
    recentlyUpdated: documents
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  };

  return stats;
}

export function filterDocuments(documents: Document[], filters: {
  searchTerm?: string;
  documentType?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}) {
  return documents.filter(doc => {
    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.document_type.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Document type filter
    if (filters.documentType && doc.document_type !== filters.documentType) {
      return false;
    }

    // Status filter
    if (filters.status && doc.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const docDate = new Date(doc.created_at);
      if (filters.dateRange.start && docDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && docDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    return true;
  });
}
