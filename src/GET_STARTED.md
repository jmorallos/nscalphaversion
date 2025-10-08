# 🚀 Getting Started with NSC e-Registrar

## Welcome!

This is your complete guide to setting up and using the NSC e-Registrar system for the first time.

---

## 📋 Prerequisites

✅ The application is already deployed and running  
✅ You have access to the application URL  
✅ No additional setup or configuration needed  

---

## 🎯 Quick Start (3 Minutes)

### Step 1: Create Your First Admin Account

When you first open the application, you'll see the login page.

**What to do:**

1. Look at the **bottom of the login card**
2. You'll see: *"Need to create an admin account?"*
3. Click the blue **"Setup Admin Account"** link
4. A setup wizard will appear

**On the Setup Page:**

1. The form is **pre-filled** with default values:
   ```
   Email: admin@nsc.edu.ph
   First Name: Admin
   Last Name: User
   Password: admin123
   ```

2. You can either:
   - ✅ Use the defaults (recommended for testing)
   - ✏️ Change to your preferred values

3. Click **"Create Admin Account"**

4. Wait for the success message

5. You'll automatically return to the login page

---

### Step 2: Login as Admin

**Credentials:**
- Email: `admin@nsc.edu.ph`
- Password: `admin123`

**What to do:**

1. On the login page, make sure you're on the **"Login"** tab
2. Enter your admin email and password
3. Click **"Login"**
4. You'll be redirected to the **Admin Dashboard**

**🎉 Congratulations!** You now have full admin access.

---

### Step 3: Explore the Admin Dashboard

You'll see:

- **Dashboard** - Overview with statistics
- **Manage Requests** - Process student document requests
- **Messages** - Communication hub
- **Support** - Handle student tickets
- **Announcements** - Post system-wide notices

**Try This:**
1. Click **"Announcements"**
2. Create a welcome announcement
3. This will appear on all student dashboards

---

## 👨‍🎓 Testing as a Student

### Register a Test Student Account

1. **Logout** from admin account (dropdown menu → Logout)
2. On the login page, click the **"Register"** tab
3. Fill in student details:
   ```
   Email: student@test.com
   Student ID: 2024-12345
   First Name: John
   Last Name: Doe
   Password: test123
   Confirm Password: test123
   ```
4. Click **"Register"**
5. You'll be auto-logged in to the Student Dashboard

---

### Test Document Request Workflow

**As Student:**

1. Click **"Request Document"** in sidebar
2. Select document type: **Transcript of Records**
3. Choose quantity: **1 copy**
4. Click **"Proceed"** → **"Confirm Request"**
5. Go to **"Messages"** tab
6. Open the conversation for your request
7. Type a message (simulating payment proof): "Payment sent via GCash"
8. Click **"Send"**

**As Admin (in different browser/incognito):**

1. Login as admin
2. Go to **"Manage Requests"**
3. Click **"New"** tab
4. You'll see the student's request
5. Click **"View Details"** or status dropdown
6. Change status to **"Processing"**
7. Go to **"Messages"** tab
8. Reply to the student
9. Return to **"Manage Requests"**
10. Change status to **"Ready for Pickup"**

**Back as Student:**

1. Refresh the page
2. Check **"Track Request"** - status updated!
3. Check **"Messages"** - admin's reply!
4. View the announcement on Dashboard

---

## 🔐 Security Tips

### Change Default Password

**Important:** If you used the default password (`admin123`), change it immediately!

1. Login as admin
2. Go to profile settings
3. Update your password
4. Use a strong, unique password

### Best Practices

✅ Use strong passwords (8+ characters, mixed case, numbers, symbols)  
✅ Never share admin credentials  
✅ Logout when done  
✅ Review user access regularly  
✅ Keep student data confidential  

---

## 📚 System Features

### For Students

| Feature | Description |
|---------|-------------|
| **Request Documents** | Submit requests for TOR, Diploma, Certificates |
| **Track Status** | Real-time updates on request progress |
| **Messages** | Direct communication with registrar |
| **Payment Proof** | Upload proof via messaging |
| **Support Tickets** | Get help with detailed support system |
| **Announcements** | Stay updated with important notices |

### For Admins

| Feature | Description |
|---------|-------------|
| **Request Management** | Process and track all student requests |
| **Status Updates** | Manage workflow: Pending → Processing → Ready → Completed |
| **Messaging** | Respond to all student inquiries |
| **Support Management** | Handle student support tickets |
| **Announcements** | Create system-wide announcements |
| **Dashboard** | View statistics and metrics |

---

## 🎓 Document Types & Pricing

All documents: **₱150 per copy**

Available documents:
- 📄 Transcript of Records (TOR)
- 🎓 Diploma
- 📋 Certificate of Enrollment
- 📊 Certificate of Grades
- ✉️ Honorable Dismissal

**Limitations:**
- Maximum 2 active requests per student
- Maximum 2 copies per request

---

## ❓ Common Questions

### Q: I forgot the admin password. What do I do?

**A:** There's currently no password reset. You'll need to create a new admin account with a different email.

### Q: Can students cancel requests?

**A:** No, students cannot cancel requests after payment confirmation. This is by design to prevent fraud.

### Q: How do students upload payment proof?

**A:** Students send payment screenshots or details via the messaging system for each request.

### Q: Can I have multiple admins?

**A:** Yes! Use the `/seed-admin` endpoint to create additional admin accounts.

---

## 🆘 Need Help?

### Getting Errors?

1. Check the browser console (F12 → Console tab)
2. Ensure admin account was created successfully
3. Try clearing browser cache and logging in again
4. Check `/ERROR_FIXES_v2.md` for known issues

### Technical Issues?

- 📧 Email: registrar@nsc.edu.ph
- 📞 Phone: (123) 456-7890
- ⏰ Office Hours: Mon-Fri, 8:00 AM - 5:00 PM

---

## 🎉 You're Ready!

Your NSC e-Registrar system is fully set up and ready to use.

**Next Steps:**
1. ✅ Change default admin password
2. ✅ Create a welcome announcement
3. ✅ Invite students to register
4. ✅ Test the complete workflow
5. ✅ Train your registrar staff

**Enjoy using NSC e-Registrar!** 🎓

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Production Ready ✅
