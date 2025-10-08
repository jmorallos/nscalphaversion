import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { apiClient } from '../../utils/api';
import { toast } from 'sonner@2.0.3';
import { MessageSquare, Send, Paperclip, Lock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface MessagesProps {
  user: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' }
};

export function Messages({ user }: MessagesProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await apiClient.getConversations();
      setConversations(response.conversations || []);
      
      // Auto-select first conversation if available
      if (response.conversations && response.conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(response.conversations[0]);
      }
    } catch (error: any) {
      toast.error('Failed to load conversations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await apiClient.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error: any) {
      toast.error('Failed to load messages');
      console.error(error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await apiClient.sendMessage({
        conversationId: selectedConversation.id,
        text: messageText.trim()
      });

      setMessages([...messages, response.message]);
      setMessageText('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isConversationLocked = selectedConversation?.status === 'completed';

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <Skeleton className="h-full" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl mb-2">No Active Conversations</h3>
          <p className="text-gray-600">
            Conversations will appear here when you make a document request.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl">Messages</h1>
        <p className="text-gray-600">Chat with registrar about your requests</p>
      </div>

      <div className="grid lg:grid-cols-[350px,1fr] gap-4 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-18rem)]">
              <div className="space-y-2 p-4">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm truncate">
                        {conv.documentType.toUpperCase()}
                      </span>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <Badge className={`text-xs ${STATUS_CONFIG[conv.status].color}`}>
                      {STATUS_CONFIG[conv.status].label}
                    </Badge>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        {conv.lastMessage.text}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedConversation.documentType.toUpperCase()}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Request ID: {selectedConversation.id.substring(0, 8)}...
                    </p>
                  </div>
                  <Badge className={STATUS_CONFIG[selectedConversation.status].color}>
                    {STATUS_CONFIG[selectedConversation.status].label}
                  </Badge>
                </div>
              </CardHeader>

              {isConversationLocked && (
                <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Conversation closed</span>
                </div>
              )}

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user.id;
                    const isSystem = message.senderId === 'system';

                    if (isSystem) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-md text-center">
                            {message.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs mb-1 opacity-75">{message.senderName}</p>
                          )}
                          <p className="text-sm">{message.text}</p>
                          {message.fileUrl && (
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline mt-1 block"
                            >
                              View attachment
                            </a>
                          )}
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                {!isConversationLocked ? (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Button type="button" variant="outline" size="icon" disabled>
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    This conversation has been closed
                  </div>
                )}
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
