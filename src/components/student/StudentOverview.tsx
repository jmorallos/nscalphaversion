import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Clock, CheckCircle, MessageSquare, Bell } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';

interface StudentOverviewProps {
  user: any;
  onNavigate: (tab: string) => void;
}

export function StudentOverview({ user, onNavigate }: StudentOverviewProps) {
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    ready: 0,
    messages: 0
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsRes, conversationsRes, announcementsRes] = await Promise.all([
        apiClient.getRequests(),
        apiClient.getConversations(),
        apiClient.getAnnouncements()
      ]);

      const requests = requestsRes.requests || [];
      const conversations = conversationsRes.conversations || [];

      setStats({
        pending: requests.filter((r: any) => r.status === 'pending').length,
        processing: requests.filter((r: any) => r.status === 'processing').length,
        ready: requests.filter((r: any) => r.status === 'ready').length,
        messages: conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0)
      });

      setAnnouncements(announcementsRes.announcements || []);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusCards = [
    { 
      label: 'Pending Requests', 
      value: stats.pending, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      tab: 'track'
    },
    { 
      label: 'Processing', 
      value: stats.processing, 
      icon: FileText, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tab: 'track'
    },
    { 
      label: 'Ready for Pickup', 
      value: stats.ready, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      tab: 'track'
    },
    { 
      label: 'Unread Messages', 
      value: stats.messages, 
      icon: MessageSquare, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tab: 'messages'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl">Welcome back, {user.firstName}!</h1>
        <p className="text-gray-600">Here's your document request overview</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate(card.tab)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.label}</p>
                    <p className="text-3xl mt-2">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg">Need a document?</h3>
              <p className="text-gray-600 text-sm">Request academic documents online</p>
            </div>
            <Button onClick={() => onNavigate('request')}>
              Request a Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle>Announcements</CardTitle>
          </div>
          <CardDescription>Latest updates from the registrar</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements at this time</p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-600 pl-4 py-2">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{announcement.body}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
