import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as bcrypt from "npm:bcryptjs@2.4.3";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper to verify auth
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
};

// Health check endpoint
app.get("/make-server-30ffa568/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTH ROUTES ==========

// Sign up (Students only)
app.post("/make-server-30ffa568/signup", async (c) => {
  try {
    const { email, studentId, firstName, lastName, password } = await c.req.json();
    
    // Validate input
    if (!email || !studentId || !firstName || !lastName || !password) {
      return c.json({ error: "All fields are required" }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`user_by_email:${email.toLowerCase()}`);
    if (existingUser) {
      return c.json({ error: "Email already registered" }, 400);
    }

    // Check if student ID is already used
    const existingStudentId = await kv.get(`user_by_studentid:${studentId}`);
    if (existingStudentId) {
      return c.json({ error: "Student ID already registered" }, 400);
    }

    // Create user in Supabase Auth
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { 
        firstName, 
        lastName, 
        studentId,
        role: 'student'
      }
    });

    if (error) {
      console.error('Supabase auth error during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV
    const userId = data.user.id;
    const userProfile = {
      id: userId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      studentId,
      role: 'student',
      createdAt: new Date().toISOString()
    };

    await kv.mset(
      [`user:${userId}`, `user_by_email:${email.toLowerCase()}`, `user_by_studentid:${studentId}`],
      [userProfile, userId, userId]
    );

    return c.json({ 
      success: true,
      user: { id: userId, ...userProfile }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Login (Students & Admins)
app.post("/make-server-30ffa568/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return c.json({ error: "Incorrect email or password" }, 401);
    }

    // Get user profile
    const userId = await kv.get(`user_by_email:${email.toLowerCase()}`);
    if (!userId) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const userProfile = await kv.get(`user:${userId}`);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      user: userProfile
    });
  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Get current user
app.get("/make-server-30ffa568/me", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    return c.json({ user: userProfile });
  } catch (error) {
    console.error('Error getting current user:', error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// ========== DOCUMENT REQUEST ROUTES ==========

// Create document request
app.post("/make-server-30ffa568/requests", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'student') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { documentType, quantity } = await c.req.json();

    // Check active requests limit (max 2)
    const allRequests = await kv.getByPrefix(`request:${user.id}:`);
    const activeRequests = allRequests.filter((req: any) => 
      req.status !== 'completed'
    );

    if (activeRequests.length >= 2) {
      return c.json({ error: "Maximum 2 active requests allowed" }, 400);
    }

    const requestId = crypto.randomUUID();
    const pricePerCopy = 150;
    const total = pricePerCopy * quantity;

    const request = {
      id: requestId,
      studentId: user.id,
      studentName: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`,
      documentType,
      quantity,
      pricePerCopy,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`request:${user.id}:${requestId}`, request);
    await kv.set(`request_by_id:${requestId}`, request);

    // Create initial system message
    const messageId = crypto.randomUUID();
    const systemMessage = {
      id: messageId,
      conversationId: requestId,
      senderId: 'system',
      senderName: 'System',
      text: 'Your request has been received. Please upload proof of payment.',
      timestamp: new Date().toISOString(),
      read: false
    };

    await kv.set(`message:${requestId}:${messageId}`, systemMessage);

    return c.json({ success: true, request, message: systemMessage });
  } catch (error) {
    console.error('Error creating request:', error);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

// Get student's requests
app.get("/make-server-30ffa568/requests", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let requests = [];
    if (user.user_metadata?.role === 'student') {
      requests = await kv.getByPrefix(`request:${user.id}:`);
    } else if (user.user_metadata?.role === 'admin') {
      // Get all requests for admin
      const allRequests = await kv.getByPrefix('request_by_id:');
      requests = allRequests;
    }

    // Sort by createdAt descending
    requests.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ requests });
  } catch (error) {
    console.error('Error getting requests:', error);
    return c.json({ error: "Failed to get requests" }, 500);
  }
});

// Update request status (Admin only)
app.put("/make-server-30ffa568/requests/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const requestId = c.req.param('id');
    const { status } = await c.req.json();

    const request = await kv.get(`request_by_id:${requestId}`);
    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    const updatedRequest = {
      ...request,
      status,
      updatedAt: new Date().toISOString()
    };

    await kv.mset(
      [`request:${request.studentId}:${requestId}`, `request_by_id:${requestId}`],
      [updatedRequest, updatedRequest]
    );

    // Create system message for status change
    const messageId = crypto.randomUUID();
    let messageText = '';
    switch(status) {
      case 'processing':
        messageText = 'Payment confirmed. Your request is now being processed.';
        break;
      case 'ready':
        messageText = 'Your document is ready for pickup!';
        break;
      case 'completed':
        messageText = 'Request completed. Thank you!';
        break;
    }

    if (messageText) {
      const systemMessage = {
        id: messageId,
        conversationId: requestId,
        senderId: 'system',
        senderName: 'System',
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false
      };
      await kv.set(`message:${requestId}:${messageId}`, systemMessage);
    }

    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Error updating request:', error);
    return c.json({ error: "Failed to update request" }, 500);
  }
});

// ========== MESSAGE ROUTES ==========

// Send message
app.post("/make-server-30ffa568/messages", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { conversationId, text, fileUrl } = await c.req.json();

    // Verify conversation exists
    const request = await kv.get(`request_by_id:${conversationId}`);
    if (!request) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    // Check if conversation is locked (completed)
    if (request.status === 'completed') {
      return c.json({ error: "Conversation is closed" }, 400);
    }

    const messageId = crypto.randomUUID();
    const message = {
      id: messageId,
      conversationId,
      senderId: user.id,
      senderName: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`,
      senderRole: user.user_metadata.role,
      text,
      fileUrl,
      timestamp: new Date().toISOString(),
      read: false
    };

    await kv.set(`message:${conversationId}:${messageId}`, message);

    return c.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Get messages for a conversation
app.get("/make-server-30ffa568/messages/:conversationId", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const conversationId = c.req.param('conversationId');
    const messages = await kv.getByPrefix(`message:${conversationId}:`);

    // Sort by timestamp
    messages.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return c.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

// Get all conversations
app.get("/make-server-30ffa568/conversations", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let requests = [];
    if (user.user_metadata?.role === 'student') {
      requests = await kv.getByPrefix(`request:${user.id}:`);
    } else if (user.user_metadata?.role === 'admin') {
      requests = await kv.getByPrefix('request_by_id:');
    }

    // Get last message for each conversation
    const conversations = await Promise.all(
      requests.map(async (request: any) => {
        const messages = await kv.getByPrefix(`message:${request.id}:`);
        messages.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return {
          ...request,
          lastMessage: messages[0] || null,
          unreadCount: messages.filter((m: any) => !m.read && m.senderId !== user.id).length
        };
      })
    );

    // Sort by last message timestamp
    conversations.sort((a: any, b: any) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    return c.json({ conversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return c.json({ error: "Failed to get conversations" }, 500);
  }
});

// ========== SUPPORT TICKET ROUTES ==========

// Create support ticket
app.post("/make-server-30ffa568/tickets", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'student') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { subject, description, attachmentUrl } = await c.req.json();

    const ticketId = crypto.randomUUID();
    const ticket = {
      id: ticketId,
      studentId: user.id,
      studentName: `${user.user_metadata.firstName} ${user.user_metadata.lastName}`,
      subject,
      description,
      attachmentUrl,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.mset(
      [`ticket:${user.id}:${ticketId}`, `ticket_by_id:${ticketId}`],
      [ticket, ticket]
    );

    return c.json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return c.json({ error: "Failed to create ticket" }, 500);
  }
});

// Get tickets
app.get("/make-server-30ffa568/tickets", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let tickets = [];
    if (user.user_metadata?.role === 'student') {
      tickets = await kv.getByPrefix(`ticket:${user.id}:`);
    } else if (user.user_metadata?.role === 'admin') {
      tickets = await kv.getByPrefix('ticket_by_id:');
    }

    tickets.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ tickets });
  } catch (error) {
    console.error('Error getting tickets:', error);
    return c.json({ error: "Failed to get tickets" }, 500);
  }
});

// Update ticket status (Admin only)
app.put("/make-server-30ffa568/tickets/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const ticketId = c.req.param('id');
    const { status } = await c.req.json();

    const ticket = await kv.get(`ticket_by_id:${ticketId}`);
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    const updatedTicket = {
      ...ticket,
      status,
      updatedAt: new Date().toISOString()
    };

    await kv.mset(
      [`ticket:${ticket.studentId}:${ticketId}`, `ticket_by_id:${ticketId}`],
      [updatedTicket, updatedTicket]
    );

    return c.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return c.json({ error: "Failed to update ticket" }, 500);
  }
});

// ========== ANNOUNCEMENT ROUTES ==========

// Get all active announcements
app.get("/make-server-30ffa568/announcements", async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement:');
    
    // Filter active and not expired
    const now = new Date();
    const activeAnnouncements = announcements.filter((a: any) => 
      a.active && new Date(a.expiryDate) > now
    );

    activeAnnouncements.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ announcements: activeAnnouncements });
  } catch (error) {
    console.error('Error getting announcements:', error);
    return c.json({ error: "Failed to get announcements" }, 500);
  }
});

// Create announcement (Admin only)
app.post("/make-server-30ffa568/announcements", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { title, body, expiryDate } = await c.req.json();

    const announcementId = crypto.randomUUID();
    const announcement = {
      id: announcementId,
      title,
      body,
      expiryDate,
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    await kv.set(`announcement:${announcementId}`, announcement);

    return c.json({ success: true, announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return c.json({ error: "Failed to create announcement" }, 500);
  }
});

// Update announcement (Admin only)
app.put("/make-server-30ffa568/announcements/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const announcementId = c.req.param('id');
    const updates = await c.req.json();

    const announcement = await kv.get(`announcement:${announcementId}`);
    if (!announcement) {
      return c.json({ error: "Announcement not found" }, 404);
    }

    const updatedAnnouncement = {
      ...announcement,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`announcement:${announcementId}`, updatedAnnouncement);

    return c.json({ success: true, announcement: updatedAnnouncement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return c.json({ error: "Failed to update announcement" }, 500);
  }
});

// Delete announcement (Admin only)
app.delete("/make-server-30ffa568/announcements/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const announcementId = c.req.param('id');
    await kv.del(`announcement:${announcementId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return c.json({ error: "Failed to delete announcement" }, 500);
  }
});

// ========== AUTO-INITIALIZE DEFAULT ADMIN ==========

// Auto-create default admin on server startup
const initializeDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@example.com';
    const existing = await kv.get(`user_by_email:${adminEmail}`);
    
    if (existing) {
      console.log('Default admin already exists');
      return;
    }

    console.log('Creating default admin account...');
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: '123456',
      email_confirm: true,
      user_metadata: { 
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating default admin:', error);
      return;
    }

    const userId = data.user.id;
    const adminProfile = {
      id: userId,
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    await kv.mset(
      [`user:${userId}`, `user_by_email:${adminEmail}`],
      [adminProfile, userId]
    );

    console.log('Default admin created successfully:', adminEmail);
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
};

// Initialize admin on startup
initializeDefaultAdmin();

Deno.serve(app.fetch);
