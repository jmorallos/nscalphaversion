# NSC e-Registrar - Setup Guide

## Overview
The NSC e-Registrar is a complete digital platform for managing student document requests with role-based access for students and administrators.

## Initial Setup

### Step 1: Create Admin Account

Before students can use the system, you need to create an admin account.

**Method 1: Using the Admin Setup Component (Recommended)**
1. Temporarily modify `/App.tsx` to show the AdminSetup component
2. Fill in the admin details and submit
3. Revert the App.tsx changes

**Method 2: Using API Directly**
Send a POST request to the `/seed-admin` endpoint with:
```json
{
  "email": "admin@nsc.edu.ph",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Default Admin Credentials:**
- Email: `admin@nsc.edu.ph`
- Password: `admin123`

⚠️ **Important:** Change the admin password immediately after first login.

### Step 2: System is Ready

Once the admin account is created, the system is fully operational:
- Admin can login and manage the system
- Students can register and submit requests
- All workflows are functional

## User Roles

### Student Role
**Registration:**
- Students can self-register via the registration form
- Required fields: Email, Student ID, First Name, Last Name, Password

**Capabilities:**
- Request academic documents (TOR, Diploma, Certificates)
- Track request status
- Upload payment proof via messaging
- Chat with registrar about requests
- Submit support tickets
- View announcements

**Limitations:**
- Maximum 2 active requests at a time
- Maximum 2 copies per request
- Cannot cancel after payment confirmation

### Admin Role
**Login:**
- Admins login with their credentials
- Accounts must be created via the seed-admin endpoint

**Capabilities:**
- View dashboard with request statistics
- Process and manage all document requests
- Update request status (Pending → Processing → Ready → Completed)
- Communicate with students via messaging
- Manage support tickets
- Create, edit, and delete announcements
- View all system data

## Document Request Workflow

1. **Student Submits Request**
   - Selects document type and quantity
   - Reviews total cost (₱150 per copy)
   - Confirms request submission

2. **Automatic Conversation Created**
   - System creates a message thread
   - Student receives prompt to upload payment proof

3. **Payment Verification**
   - Student uploads proof of payment in chat
   - Admin reviews and confirms payment
   - Admin updates status to "Processing"

4. **Document Preparation**
   - Admin prepares the document
   - Updates status to "Ready for Pickup"
   - Student receives notification

5. **Completion**
   - Student picks up document
   - Admin marks as "Completed"
   - Conversation is locked

## Support System

### FAQ Section
- Pre-populated with common questions
- Available to all students
- Covers payment, processing time, pickup, etc.

### Support Tickets
- Students can submit detailed support requests
- Admins can track and respond to tickets
- Status tracking: Open → In Progress → Resolved

## Announcements

Admins can create announcements with:
- Title and message body
- Expiry date
- Active/Inactive toggle
- Automatic filtering of expired announcements

Students see active announcements on their dashboard.

## Security Features

- Password encryption with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Auto-logout on inactivity
- Input validation on all forms
- Secure session management

## Data Privacy Notice

⚠️ **Important:** This system handles personally identifiable information (PII). Before deploying to production:

1. Ensure compliance with data privacy regulations (e.g., Data Privacy Act)
2. Implement proper encryption for data at rest
3. Add SSL/TLS for data in transit
4. Create privacy policy and terms of service
5. Implement audit logging
6. Set up regular backups
7. Configure proper access controls

## Technical Stack

- **Frontend:** React + TypeScript
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Backend:** Supabase Edge Functions (Hono)
- **Database:** Supabase KV Store
- **Authentication:** Supabase Auth
- **Real-time:** Message polling (can be upgraded to real-time subscriptions)

## Environment Configuration

The system uses Supabase environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

These are automatically configured in Figma Make.

## Testing the System

### Test as Student:
1. Register a new student account
2. Submit a document request
3. Upload "payment proof" via messaging
4. Track request status
5. Submit a support ticket

### Test as Admin:
1. Login with admin credentials
2. View new requests in dashboard
3. Update request status
4. Respond to student messages
5. Create an announcement
6. Manage support tickets

## Common Issues

**Issue:** "Unauthorized" error
- **Solution:** Ensure you're logged in with the correct role

**Issue:** "Maximum requests reached"
- **Solution:** Wait for existing requests to be completed or contact admin

**Issue:** Cannot send message
- **Solution:** Check if conversation is locked (completed status)

**Issue:** Admin not found
- **Solution:** Run the seed-admin endpoint first

## Future Enhancements

Potential improvements:
- Email notifications
- File upload for payment proof
- Digital document delivery
- Payment gateway integration
- Real-time messaging with WebSocket
- Advanced reporting and analytics
- Multi-language support
- Mobile app version

## Support

For technical issues or questions:
- Email: registrar@nsc.edu.ph
- Phone: (123) 456-7890
- Office Hours: Mon-Fri, 8:00 AM - 5:00 PM

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Developed for:** NSC e-Registrar Project
