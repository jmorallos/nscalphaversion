import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Skeleton } from '../ui/skeleton';
import { FileText, MessageSquare } from 'lucide-react';

interface ManageRequestsProps {
  user: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
};

export function ManageRequests({ user }: ManageRequestsProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await apiClient.getRequests();
      setRequests(response.requests || []);
    } catch (error: any) {
      toast.error('Failed to load requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setUpdatingId(requestId);
    try {
      await apiClient.updateRequest(requestId, { status: newStatus });
      toast.success('Request status updated successfully');
      await loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filterRequestsByStatus = (status: string[]) => {
    return requests.filter((req) => status.includes(req.status));
  };

  const RequestCard = ({ request }: { request: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg">{request.documentType.toUpperCase()}</h3>
                <Badge className={STATUS_CONFIG[request.status].color}>
                  {STATUS_CONFIG[request.status].label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-600">Student:</span>
                  <p>{request.studentName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Request ID:</span>
                  <p className="truncate">{request.id.substring(0, 8)}...</p>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <p>{request.quantity} {request.quantity > 1 ? 'copies' : 'copy'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p>₱{request.total}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={request.status}
                onValueChange={(value) => handleStatusChange(request.id, value)}
                disabled={updatingId === request.id}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Manage Requests</h1>
        <p className="text-gray-600">Review and process student document requests</p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList>
          <TabsTrigger value="new">
            New ({filterRequestsByStatus(['pending']).length})
          </TabsTrigger>
          <TabsTrigger value="in-process">
            In-Process ({filterRequestsByStatus(['processing']).length})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({filterRequestsByStatus(['ready']).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterRequestsByStatus(['completed']).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-6">
          {filterRequestsByStatus(['pending']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No new requests</p>
              </CardContent>
            </Card>
          ) : (
            filterRequestsByStatus(['pending']).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="in-process" className="space-y-4 mt-6">
          {filterRequestsByStatus(['processing']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No requests in process</p>
              </CardContent>
            </Card>
          ) : (
            filterRequestsByStatus(['processing']).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4 mt-6">
          {filterRequestsByStatus(['ready']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No requests ready for pickup</p>
              </CardContent>
            </Card>
          ) : (
            filterRequestsByStatus(['ready']).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {filterRequestsByStatus(['completed']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No completed requests</p>
              </CardContent>
            </Card>
          ) : (
            filterRequestsByStatus(['completed']).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
