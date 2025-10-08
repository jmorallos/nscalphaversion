import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { Bell, Plus, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface AdminAnnouncementsProps {
  user: any;
}

export function AdminAnnouncements({ user }: AdminAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    expiryDate: '',
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title,
        body: editingAnnouncement.body,
        expiryDate: editingAnnouncement.expiryDate.split('T')[0],
        active: editingAnnouncement.active
      });
      setShowCreateDialog(true);
    }
  }, [editingAnnouncement]);

  const loadAnnouncements = async () => {
    try {
      // Get all announcements (including inactive ones for admin)
      const response = await apiClient.getAnnouncements();
      setAnnouncements(response.announcements || []);
    } catch (error: any) {
      toast.error('Failed to load announcements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.body.trim() || !formData.expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const expiryDate = new Date(formData.expiryDate).toISOString();

      if (editingAnnouncement) {
        await apiClient.updateAnnouncement(editingAnnouncement.id, {
          ...formData,
          expiryDate
        });
        toast.success('Announcement updated successfully');
      } else {
        await apiClient.createAnnouncement({
          title: formData.title,
          body: formData.body,
          expiryDate
        });
        toast.success('Announcement created successfully');
      }

      setFormData({ title: '', body: '', expiryDate: '', active: true });
      setShowCreateDialog(false);
      setEditingAnnouncement(null);
      await loadAnnouncements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await apiClient.deleteAnnouncement(id);
      toast.success('Announcement deleted successfully');
      await loadAnnouncements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement: any) => {
    try {
      await apiClient.updateAnnouncement(announcement.id, {
        active: !announcement.active
      });
      toast.success(`Announcement ${!announcement.active ? 'activated' : 'deactivated'}`);
      await loadAnnouncements();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update announcement');
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingAnnouncement(null);
    setFormData({ title: '', body: '', expiryDate: '', active: true });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Announcements</h1>
          <p className="text-gray-600">Manage announcements shown to students</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl mb-2">No Announcements</h3>
            <p className="text-gray-600 mb-6">
              Create your first announcement to notify students
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg">{announcement.title}</h3>
                      {!announcement.active && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                      {new Date(announcement.expiryDate) < new Date() && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{announcement.body}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${announcement.id}`} className="text-sm">
                        Active
                      </Label>
                      <Switch
                        id={`active-${announcement.id}`}
                        checked={announcement.active}
                        onCheckedChange={() => handleToggleActive(announcement)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? 'Update the announcement details'
                : 'Create a new announcement for students'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Announcement message"
                rows={5}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingAnnouncement
                  ? 'Update'
                  : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
