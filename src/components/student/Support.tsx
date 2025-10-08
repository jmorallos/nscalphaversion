import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { HelpCircle, Send } from 'lucide-react';

interface SupportProps {
  user: any;
}

const FAQ_ITEMS = [
  {
    question: 'How long does it take to process a document request?',
    answer: 'Document processing typically takes 3-5 business days after payment confirmation. You will be notified when your document is ready for pickup.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept bank transfers, GCash, and cash payments at the registrar office. Please upload proof of payment after making your payment.'
  },
  {
    question: 'Can I cancel my request?',
    answer: 'Requests cannot be cancelled after payment has been confirmed. Please contact support if you have special circumstances.'
  },
  {
    question: 'How will I know when my document is ready?',
    answer: 'You will receive a notification in the Messages section when your document status changes to "Ready for Pickup".'
  },
  {
    question: 'Where can I pick up my documents?',
    answer: 'Documents can be picked up at the Registrar Office during office hours (Monday-Friday, 8:00 AM - 5:00 PM).'
  },
  {
    question: 'What do I need to bring when picking up documents?',
    answer: 'Please bring a valid ID and your Request ID number for verification purposes.'
  },
  {
    question: 'Can someone else pick up my documents?',
    answer: 'Yes, you can authorize someone to pick up your documents by providing them with a written authorization letter and a copy of your valid ID.'
  },
  {
    question: 'How many copies can I request at once?',
    answer: 'You can request up to 2 copies per request, with a maximum of 2 active requests at a time.'
  }
];

export function Support({ user }: SupportProps) {
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketData.subject.trim() || !ticketData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createTicket({
        subject: ticketData.subject,
        description: ticketData.description
      });

      toast.success('Support ticket submitted successfully! We will respond shortly.');
      setTicketData({ subject: '', description: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl">Support</h1>
        <p className="text-gray-600">Get help and submit support tickets</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <CardTitle>Frequently Asked Questions</CardTitle>
            </div>
            <CardDescription>
              Find answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Submit Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
            <CardDescription>
              Can't find an answer? Send us a message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about your issue..."
                  rows={6}
                  value={ticketData.description}
                  onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  We typically respond to support tickets within 24-48 hours during business days.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Other ways to reach us
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm mb-1">Email</h4>
              <p className="text-sm text-gray-600">registrar@nsc.edu.ph</p>
            </div>
            <div>
              <h4 className="text-sm mb-1">Phone</h4>
              <p className="text-sm text-gray-600">(123) 456-7890</p>
            </div>
            <div>
              <h4 className="text-sm mb-1">Office Hours</h4>
              <p className="text-sm text-gray-600">Mon-Fri, 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
