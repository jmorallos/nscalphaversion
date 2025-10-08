import { useState } from 'react';
import { GraduationCap, Home, FileText, MessageSquare, HelpCircle, Bell, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { AdminOverview } from './AdminOverview';
import { ManageRequests } from './ManageRequests';
import { AdminMessages } from './AdminMessages';
import { AdminSupport } from './AdminSupport';
import { AdminAnnouncements } from './AdminAnnouncements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { apiClient } from '../../utils/api';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      apiClient.logout();
      onLogout();
    }
  };

  const navigation = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'requests', label: 'Manage Requests', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const NavigationItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    <span>NSC e-Registrar</span>
                  </div>
                </div>
                <nav className="p-4 flex flex-col gap-2 h-[calc(100vh-73px)]">
                  <NavigationItems />
                </nav>
              </SheetContent>
            </Sheet>
            <GraduationCap className="w-6 h-6 text-blue-600 hidden lg:block" />
            <span className="hidden lg:block">NSC e-Registrar</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {user.firstName} {user.lastName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 flex flex-col gap-2 h-full">
            <NavigationItems />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {activeTab === 'overview' && <AdminOverview user={user} onNavigate={setActiveTab} />}
          {activeTab === 'requests' && <ManageRequests user={user} />}
          {activeTab === 'messages' && <AdminMessages user={user} />}
          {activeTab === 'support' && <AdminSupport user={user} />}
          {activeTab === 'announcements' && <AdminAnnouncements user={user} />}
        </main>
      </div>
    </div>
  );
}
