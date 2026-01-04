# 🚀 E-Complaint Portal - Quick Start Guide

## 📋 Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Running the Application](#running-the-application)
3. [User Guides](#user-guides)
4. [Admin Guide](#admin-guide)
5. [Testing the Features](#testing-the-features)
6. [Troubleshooting](#troubleshooting)

---

## 📦 Installation & Setup

### Step 1: Navigate to Project Directory
```powershell
cd "c:\Users\Disha\OneDrive\Desktop\MiniProj"
```

### Step 2: Install Dependencies
```powershell
npm install
```

This will install:
- Express.js (Web server)
- CORS (Cross-Origin Resource Sharing)
- Nodemon (Development tool)

### Step 3: Verify Installation
Check if `node_modules` folder is created with all dependencies.

---

## 🎯 Running the Application

### Start the Server
```powershell
npm start
```

You should see:
```
============================================================
  E-COMPLAINT PORTAL - SERVER RUNNING
============================================================

  🌐 Local:            http://localhost:3000
  📊 API Endpoint:     http://localhost:3000/api
  📁 Data Directory:   C:\Users\Disha\OneDrive\Desktop\MiniProj\data
  ...
```

### Access the Website
Open your browser and go to:
- **Homepage:** http://localhost:3000/index.html
- **Submit Complaint:** http://localhost:3000/submit-complaint.html
- **Track Complaint:** http://localhost:3000/track-complaint.html
- **Admin Dashboard:** http://localhost:3000/admin-dashboard.html

---

## 👤 User Guides

### For Citizens

#### 1. Register an Account
1. Go to http://localhost:3000/register.html
2. Fill in your details:
   - Full Name
   - Email Address
   - Mobile Number (10 digits)
   - Password (minimum 6 characters)
3. Accept terms and click **Register**
4. You'll be redirected to login page

#### 2. Submit a Complaint
1. Go to http://localhost:3000/submit-complaint.html
2. Fill the complaint form:
   - **Personal Information:**
     - Full Name
     - Contact Number (10 digits)
     - Email Address
   - **Complaint Details:**
     - Category (Road, Water, Electricity, etc.)
     - Priority (High/Medium/Low)
     - Location (exact address)
     - Description (minimum 20 characters)
     - Upload Image (optional, max 5MB)
3. Click **Submit Complaint**
4. **Save your Complaint ID!** (e.g., CPL20260001)

#### 3. Track Your Complaint
1. Go to http://localhost:3000/track-complaint.html
2. Enter your **Complaint ID**
3. Click **Track**
4. You'll see:
   - Complaint details
   - Current status
   - Status timeline
   - Department assigned
   - Updates/notes (if any)

#### 4. Provide Feedback (After Resolution)
Once your complaint is resolved:
1. Track your complaint
2. Scroll to the **Feedback Section**
3. Rate your experience (1-5 stars)
4. Add optional comments
5. Submit feedback

---

## 👨‍💼 Admin Guide

### Admin Login
1. Go to http://localhost:3000/admin-login.html
2. Use credentials:
   - **Email:** admin@ecomplaint.gov
   - **Password:** admin123
3. Click **Admin Login**

### Admin Dashboard Features

#### View Overview
The dashboard shows:
- Total Complaints
- Pending Complaints
- In Progress Complaints
- Resolved Complaints

#### Filter Complaints
Use filters to find specific complaints:
- **By Category:** Road, Water, Electricity, etc.
- **By Status:** Pending, Assigned, In Progress, Resolved
- **By Priority:** High, Medium, Low
- **By Department:** Public Works, Water Supply, etc.

#### Search Complaints
Use the search box to find by:
- Complaint ID
- Citizen name
- Location
- Category

#### View Complaint Details
1. Click the **Eye Icon** (👁️) next to any complaint
2. See complete details including:
   - All citizen information
   - Complaint description
   - Attached image
   - Current status

#### Update Complaint
1. Click the **Edit Icon** (✏️) next to any complaint
2. Update:
   - **Status:** Pending → Assigned → In Progress → Resolved
   - **Department:** Assign to relevant department
   - **Priority:** Change priority level
   - **Notes:** Add admin notes for updates
3. Click **Update**

#### Export Data
Click **Export** button to download all complaints as CSV file.

---

## 🏢 Department Officer Guide

### Department Login
1. Go to http://localhost:3000/department-login.html
2. Use credentials:
   - **Email:** dept@ecomplaint.gov
   - **Password:** dept123
   - **Department:** Select your department
3. Click **Department Login**

### Managing Complaints
Department officers can:
- View complaints assigned to their department
- Update progress status
- Add resolution notes
- Mark complaints as resolved

---

## ✅ Testing the Features

### Test 1: Submit a Complaint
1. Go to Submit Complaint page
2. Fill form with sample data:
   ```
   Name: Test User
   Phone: 9876543210
   Email: test@example.com
   Category: Road Damage
   Location: Main Street, Near Market
   Description: Large pothole causing traffic issues
   ```
3. Submit and note the Complaint ID

### Test 2: Track the Complaint
1. Go to Track Complaint page
2. Enter the Complaint ID you received
3. Verify all details are displayed correctly

### Test 3: Admin Update
1. Login as admin
2. Find your test complaint
3. Update status to "In Progress"
4. Assign to "Public Works" department
5. Add a note: "Work scheduled for next week"
6. Save changes

### Test 4: Verify Timeline
1. Track the complaint again as citizen
2. Verify the status timeline shows:
   - ✅ Submitted
   - ✅ Assigned
   - ✅ In Progress
   - ⏳ Resolved (pending)

### Test 5: Resolve and Feedback
1. Admin: Update status to "Resolved"
2. Citizen: Track complaint
3. Provide 5-star feedback
4. Submit

---

## 🛠️ Troubleshooting

### Server Won't Start

**Error:** "npm: command not found"
**Solution:**
```powershell
# Install Node.js from https://nodejs.org/
# Then restart PowerShell and try again
```

**Error:** "Port 3000 already in use"
**Solution:**
```powershell
# Stop any process using port 3000
# Or change PORT in server/server.js to 3001
```

### Cannot Submit Complaint

**Issue:** Form validation errors
**Solution:**
- Ensure all required fields are filled
- Phone number must be exactly 10 digits
- Email must be valid format
- Description minimum 20 characters

### Complaint Not Found When Tracking

**Issue:** "Complaint Not Found" message
**Solution:**
- Double-check the Complaint ID (case-sensitive)
- Ensure server is running
- Check if complaint was saved (look in data/complaints.json)

### Admin Dashboard Not Loading

**Issue:** Dashboard shows no data
**Solution:**
- Ensure server is running
- Submit at least one test complaint
- Check browser console for errors (F12)

### Images Not Uploading

**Issue:** Image upload fails
**Solution:**
- Image must be JPG or PNG format
- Maximum size: 5MB
- Try a smaller image

---

## 📊 Data Storage

All data is stored in JSON files:
- **Complaints:** `data/complaints.json`
- **Users:** `data/users.json`

You can view/edit these files directly if needed.

---

## 🎨 Customization

### Change Colors
Edit `public/css/style.css`:
```css
:root {
    --primary-blue: #2563eb;  /* Change primary color */
    --primary-dark: #1e40af;  /* Change dark shade */
}
```

### Change Port
Edit `server/server.js`:
```javascript
const PORT = 3001; // Change from 3000 to any port
```

### Add More Categories
Edit `public/submit-complaint.html`:
```html
<option value="New Category">New Category</option>
```

---

## 📱 Mobile Testing

1. Find your computer's IP address:
   ```powershell
   ipconfig
   ```
2. Look for IPv4 Address (e.g., 192.168.1.100)
3. On mobile browser, go to:
   ```
   http://192.168.1.100:3000/index.html
   ```

---

## 🔒 Security Notes

⚠️ **Important:** This is a demo application!

For production use:
- Hash passwords (use bcrypt)
- Add JWT authentication
- Validate all inputs server-side
- Use HTTPS
- Implement rate limiting
- Add CSRF protection
- Use environment variables for secrets

---

## 📞 Support

For issues or questions:
- Email: support@ecomplaint.gov
- Phone: 1800-XXX-XXXX
- Check README.md for more details

---

## 🎉 Features Summary

✅ **Citizen Features:**
- Simple complaint submission
- Photo upload
- Real-time tracking
- Complaint history
- Feedback system

✅ **Admin Features:**
- Comprehensive dashboard
- Advanced filtering
- Complaint assignment
- Status management
- Data export

✅ **Technical Features:**
- Fully responsive design
- Clean, professional UI
- Fast and lightweight
- No database required
- Easy to deploy

---

**Developed by Team VoiceUp**  
Disha J Kotian & Chaithali R Shettigar  
Department of CSE, Srinivas University, Mukka

---

**Designed to improve transparency, accountability, and community well-being.** 🌟
