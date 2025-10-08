import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Skeleton } from '../ui/skeleton';
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface AdminSupportProps {
  user: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: HelpCircle },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export function AdminSupport({ user }: AdminSupportProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await apiClient.getTickets();
      setTickets(response.tickets || []);
    } catch (error: any) {
      toast.error('Failed to load tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    try {
      await apiClient.updateTicket(ticketId, { status: newStatus });
      toast.success('Ticket status updated successfully');
      await loadTickets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filterTicketsByStatus = (statuses: string[]) => {
    return tickets.filter((ticket) => statuses.includes(ticket.status));
  };

  const TicketCard = ({ ticket }: { ticket: any }) => {
    const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
    const StatusIcon = statusConfig.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StatusIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg">{ticket.subject}</h3>
                  <Badge className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600">Student:</span>
                    <p>{ticket.studentName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ticket ID:</span>
                    <p className="truncate">{ticket.id.substring(0, 8)}...</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Date:</span>
                    <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={ticket.status}
                  onValueChange={(value) => handleStatusChange(ticket.id, value)}
                  disabled={updatingId === ticket.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setSelectedTicket(ticket)}>
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <h1 className="text-3xl">Support Tickets</h1>
        <p className="text-gray-600">Manage and respond to student support requests</p>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">
            Open ({filterTicketsByStatus(['open']).length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({filterTicketsByStatus(['in_progress']).length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({filterTicketsByStatus(['resolved']).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4 mt-6">
          {filterTicketsByStatus(['open']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No open tickets</p>
              </CardContent>
            </Card>
          ) : (
            filterTicketsByStatus(['open']).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4 mt-6">
          {filterTicketsByStatus(['in_progress']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No tickets in progress</p>
              </CardContent>
            </Card>
          ) : (
            filterTicketsByStatus(['in_progress']).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {filterTicketsByStatus(['resolved']).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No resolved tickets</p>
              </CardContent>
            </Card>
          ) : (
            filterTicketsByStatus(['resolved']).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Support Ticket Details</DialogTitle>
            <DialogDescription>
              Complete information about the support request
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Ticket ID:</span>
                  <span className="text-sm">{selectedTicket.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Student:</span>
                  <span>{selectedTicket.studentName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={STATUS_CONFIG[selectedTicket.status].color}>
                    {STATUS_CONFIG[selectedTicket.status].label}
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Date Submitted:</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm mb-2">Subject</h4>
                <p>{selectedTicket.subject}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm mb-2">Description</h4>
                <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.attachmentUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm mb-2">Attachment</h4>
                  <a
                    href={selectedTicket.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View attachment
                  </a>
                </div>
              )}

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => setSelectedTicket(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
