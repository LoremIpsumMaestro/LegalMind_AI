import { Card } from '@/components/ui/card';
import { Document } from '@/hooks/useDocuments';
import { getDocumentStats } from '@/utils/documentUtils';

interface DocumentStatsProps {
  documents: Document[];
}

export function DocumentStats({ documents }: DocumentStatsProps) {
  const stats = getDocumentStats(documents);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Document Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Content className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-gray-500">
                Total Documents
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium">By Type</h4>
              {stats.byType.map(({ type, count, percentage }) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="text-gray-500">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium">By Status</h4>
              {stats.byStatus.map(({ status, count, percentage }) => (
                <div key={status} className="flex justify-between text-sm">
                  <span>{status}</span>
                  <span className="text-gray-500">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Content className="p-4">
          <h4 className="font-medium mb-3">Recently Updated</h4>
          <div className="space-y-2">
            {stats.recentlyUpdated.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-sm text-gray-500">
                    {doc.document_type} | {doc.status}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
