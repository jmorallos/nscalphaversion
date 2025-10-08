import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Clock, FileText, CheckCircle, Package } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Skeleton } from '../ui/skeleton';

interface AdminOverviewProps {
  user: any;
  onNavigate: (tab: string) => void;
}

export function AdminOverview({ user, onNavigate }: AdminOverviewProps) {
  const [stats, setStats] = useState({
    newRequests: 0,
    pending: 0,
    processing: 0,
    ready: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.getRequests();
      const requests = response.requests || [];

      setStats({
        newRequests: requests.filter((r: any) => r.status === 'pending').length,
        pending: requests.filter((r: any) => r.status === 'pending').length,
        processing: requests.filter((r: any) => r.status === 'processing').length,
        ready: requests.filter((r: any) => r.status === 'ready').length
      });
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusCards = [
    { 
      label: 'New Requests', 
      value: stats.newRequests, 
      icon: Clock, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      tab: 'requests'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: Clock, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      tab: 'requests'
    },
    { 
      label: 'Processing', 
      value: stats.processing, 
      icon: FileText, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tab: 'requests'
    },
    { 
      label: 'Ready for Pickup', 
      value: stats.ready, 
      icon: Package, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      tab: 'requests'
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
        <h1 className="text-3xl">Welcome, {user.firstName}!</h1>
        <p className="text-gray-600">Admin Dashboard - Document Request Management</p>
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
    </div>
  );
}
