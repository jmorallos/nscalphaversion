import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface RequestDocumentProps {
  user: any;
  onNavigate: (tab: string) => void;
}

const DOCUMENT_TYPES = [
  { value: 'tor', label: 'Transcript of Records (TOR)' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate of Enrollment' },
  { value: 'grades', label: 'Certificate of Grades' },
  { value: 'honorable', label: 'Honorable Dismissal' }
];

const PRICE_PER_COPY = 150;

export function RequestDocument({ user, onNavigate }: RequestDocumentProps) {
  const [documentType, setDocumentType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    checkActiveRequests();
  }, []);

  const checkActiveRequests = async () => {
    try {
      const response = await apiClient.getRequests();
      const active = response.requests.filter((r: any) => r.status !== 'completed').length;
      setActiveRequests(active);
    } catch (error) {
      console.error('Failed to check active requests:', error);
    }
  };

  const total = PRICE_PER_COPY * quantity;

  const handleProceed = () => {
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (activeRequests >= 2) {
      toast.error('You have reached the maximum of 2 active requests');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createRequest({
        documentType,
        quantity
      });

      toast.success('Request submitted successfully! Please upload proof of payment in Messages.');
      setShowConfirmation(false);
      
      // Reset form
      setDocumentType('');
      setQuantity(1);
      
      // Navigate to messages after a short delay
      setTimeout(() => {
        onNavigate('messages');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl">Request Document</h1>
        <p className="text-gray-600">Submit a request for academic documents</p>
      </div>

      {activeRequests >= 2 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You have reached the maximum of 2 active requests. Please wait for your current requests to be completed before submitting a new one.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Document Request Form</CardTitle>
          <CardDescription>Fill in the details for your document request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Student Name</Label>
            <Input 
              value={`${user.firstName} ${user.lastName}`} 
              disabled 
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price per Copy</Label>
              <Input value={`₱${PRICE_PER_COPY}`} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Max 2)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="2"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(2, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span>Total Cost:</span>
              <span className="text-2xl">₱{total}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onNavigate('overview')} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleProceed} 
              className="flex-1"
              disabled={activeRequests >= 2}
            >
              Proceed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Request</DialogTitle>
            <DialogDescription>
              Please review your request details before submitting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Student Name:</span>
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Document Type:</span>
                <span>{DOCUMENT_TYPES.find(t => t.value === documentType)?.label}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Cost:</span>
                <span className="text-lg">₱{total}</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                After submitting, you will need to upload proof of payment in the Messages section.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
