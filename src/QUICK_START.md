# Quick Start Guide - NSC e-Registrar

## 🚀 Getting Started in 3 Steps

### Step 1: Create Admin Account (REQUIRED)

**Important:** You must create an admin account before the system can be used.

**Option A: Using the Setup Page (Easiest)**

1. Open the application
2. On the login page, click "Setup Admin" link at the bottom
3. Fill in the admin details (default values are pre-filled)
4. Click "Create Admin Account"
5. Done! You can now login

**Option B: Using Browser Console**

Open your browser's developer console and run:

```javascript
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-30ffa568/seed-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    email: 'admin@nsc.edu.ph',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User'
  })
}).then(r => r.json()).then(console.log);
```

Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY` with your actual Supabase credentials from `/utils/supabase/info.tsx`.

**Default Admin Login:**
- **Email:** admin@nsc.edu.ph
- **Password:** admin123

### Step 2: Test Student Registration

1. Click "Register" tab on the auth page
2. Fill in the form:
   - Email: student@example.com
   - Student ID: 2024-12345
   - First Name: John
   - Last Name: Doe
   - Password: student123
   - Confirm Password: student123
3. Click "Register"
4. You'll be auto-logged in

### Step 3: Test Complete Workflow

**As Student:**
1. Navigate to "Request Document"
2. Select a document type (e.g., "Transcript of Records")
3. Choose quantity (1-2)
4. Click "Proceed" → "Confirm Request"
5. Go to "Messages" tab
6. Send a message (simulating payment proof upload)

**As Admin (open in different browser/incognito):**
1. Login with admin@nsc.edu.ph / admin123
2. View "Dashboard" - see the new request
3. Go to "Manage Requests" → "New" tab
4. Change status to "Processing"
5. Go to "Messages" tab
6. Reply to the student
7. Return to "Manage Requests"
8. Change status to "Ready for Pickup"
9. Create an announcement in "Announcements" tab

**Back as Student:**
1. Refresh and check dashboard
2. See updated status in "Track Request"
3. View announcement
4. Test "Support" tab by submitting a ticket

## 📋 Quick Reference

### Student Features
- ✅ Self-registration
- ✅ Request documents (max 2 active)
- ✅ Real-time status tracking
- ✅ Messaging with registrar
- ✅ Support ticket system
- ✅ View announcements

### Admin Features
- ✅ Request management dashboard
- ✅ Status updates (Pending → Processing → Ready → Completed)
- ✅ Student messaging
- ✅ Support ticket management
- ✅ Announcement system
- ✅ Full system oversight

### Document Request Status Flow
```
Pending → Processing → Ready for Pickup → Completed
```

### Document Types Available
- Transcript of Records (TOR)
- Diploma
- Certificate of Enrollment
- Certificate of Grades
- Honorable Dismissal

**Price:** ₱150 per copy

## 🔒 Security Notes

⚠️ **Change the default admin password immediately after first login!**

The system includes:
- Password encryption
- JWT authentication
- Role-based access control
- Auto-logout on inactivity

## 🐛 Troubleshooting

**Problem:** "Unauthorized" error  
**Solution:** Make sure you created the admin account first

**Problem:** Can't create admin  
**Solution:** Admin might already exist. Try logging in with default credentials

**Problem:** Can't submit request  
**Solution:** Check if you have 2 active requests already (maximum allowed)

**Problem:** Messages not showing  
**Solution:** Refresh the page or check if you're on the correct tab

## 📞 Support

For questions or issues:
- Check the full documentation in SETUP.md
- Email: registrar@nsc.edu.ph

## 🎯 Next Steps

After testing:
1. Change admin password
2. Customize announcements
3. Add real student accounts
4. Configure email notifications (future enhancement)
5. Review privacy and security settings

---

**Ready to start?** Create your admin account now! 🚀
