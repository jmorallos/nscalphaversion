import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Skeleton } from '../ui/skeleton';
import { FileText, Clock, CheckCircle, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface TrackRequestProps {
  user: any;
  onNavigate: (tab: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: FileText },
  ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800', icon: Package },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
};

export function TrackRequest({ user, onNavigate }: TrackRequestProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl mb-2">No Requests Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't made any document requests yet.
            </p>
            <Button onClick={() => onNavigate('request')}>
              Request a Document
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Track Requests</h1>
        <p className="text-gray-600">View and monitor all your document requests</p>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => {
          const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg">{request.documentType.toUpperCase()}</h3>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-600">Request ID:</span>
                        <p className="truncate">{request.id.substring(0, 8)}...</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <p>{request.quantity} {request.quantity > 1 ? 'copies' : 'copy'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Cost:</span>
                        <p>₱{request.total}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date Requested:</span>
                        <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about your document request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Request ID:</span>
                  <span className="text-sm">{selectedRequest.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Document Type:</span>
                  <span>{selectedRequest.documentType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={STATUS_CONFIG[selectedRequest.status].color}>
                    {STATUS_CONFIG[selectedRequest.status].label}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Quantity:</span>
                  <span>{selectedRequest.quantity}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Total Cost:</span>
                  <span>₱{selectedRequest.total}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Date Requested:</span>
                  <span>{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(selectedRequest.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm mb-3">Status Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedRequest.status !== 'pending' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm">Pending</p>
                      <p className="text-xs text-gray-500">Request submitted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedRequest.status === 'processing' || selectedRequest.status === 'ready' || selectedRequest.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <p className="text-sm">Processing</p>
                      <p className="text-xs text-gray-500">Payment confirmed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedRequest.status === 'ready' || selectedRequest.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <p className="text-sm">Ready for Pickup</p>
                      <p className="text-xs text-gray-500">Document prepared</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedRequest.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1">
                      <p className="text-sm">Completed</p>
                      <p className="text-xs text-gray-500">Document collected</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  setSelectedRequest(null);
                  onNavigate('messages');
                }}
              >
                Open Conversation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
