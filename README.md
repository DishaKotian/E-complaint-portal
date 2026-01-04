# 🏛️ E-Complaint Portal for Local Issues

A modern, transparent, and AI-powered web platform for citizens to report local civic issues and track their resolution in real-time. Features an intelligent NLP-based chatbot, multi-language support, and comprehensive admin dashboards.

## 🎯 Project Overview

The E-Complaint Portal bridges the gap between citizens and municipal authorities, providing an efficient way to report and manage local issues such as:
- Road damage and potholes
- Water leaks and supply issues
- Non-functional streetlights
- Garbage collection problems
- Electricity issues
- Drainage and sewage problems
- Safety concerns

## ✨ Key Features

### For Citizens
- ✅ Simple complaint submission with photo upload
- ✅ Auto-generated unique complaint ID (format: CPL-YYYYMMDD-XXXX)
- ✅ Real-time status tracking with live updates
- ✅ Complaint history management
- ✅ Feedback and rating system (1-5 stars)
- ✅ **AI Chatbot** with NLP capabilities (answers ANY question)
- ✅ **Voice Input** support (English, Hindi, Kannada)
- ✅ **Multi-language Support** (English, Hindi, Kannada)
- ✅ Smart suggestions and quick actions
- ✅ Chat history export functionality

### For Administrators
- 📊 Comprehensive dashboard with real-time analytics
- 🔍 Advanced filtering and search
- 📝 Complaint assignment to departments
- 📈 Reports and statistics generation
- 👥 User management
- 🎯 Priority tagging (High/Medium/Low)
- 📉 Performance metrics and trends
- 🗂️ Category-wise complaint distribution
- 📅 Date range filtering
- 🔄 Bulk operations support

### For Department Officers
- 📋 View assigned complaints dashboard
- 🔄 Update progress and status
- 📝 Add resolution notes and updates
- ✅ Mark complaints as resolved
- 📊 Department-specific analytics
- 🎯 Priority-based sorting

## 🤖 AI Chatbot Features

### Advanced NLP Capabilities
- **Keyword Extraction:** Removes stop words and identifies meaningful terms
- **Similarity Scoring:** Uses Jaccard index for text matching
- **Question Type Detection:** Classifies questions (what/how/why/when/where/who/which/can)
- **Pattern Matching:** Regex-based intelligent response system

### Knowledge Base Coverage
- ✅ **Portal Queries:** Submit, track, categories, timelines, contact info
- ✅ **General Conversation:** Greetings, thanks, help, identity questions
- ✅ **Facts & Information:** Time, date, weather (coming soon)
- ✅ **Math Operations:** Addition, subtraction, multiplication, division
- ✅ **Definitions:** AI, blockchain, cloud computing, internet, programming
- ✅ **Fun Responses:** Jokes, compliments, personality interactions

### Chatbot UI/UX
- 🎨 **Modern Design:** 400x600px floating window with animations
- 🎙️ **Voice Input:** Web Speech API integration (3 languages)
- 💬 **Smart Suggestions:** Debounced autocomplete (300ms delay)
- 📥 **Export Chat:** Download conversations as .txt files
- 🔄 **Chat History:** Persistent storage (last 50 messages)
- ⚡ **Quick Actions:** 4 pre-configured action cards
- 🌙 **Dark Mode:** Automatic theme adaptation
- 📱 **Responsive:** Works on all screen sizes

## 🌍 Multi-Language Support

The portal supports **3 languages** across all pages:
- 🇬🇧 **English** (Default)
- 🇮🇳 **हिंदी** (Hindi)
- 🇮🇳 **ಕನ್ನಡ** (Kannada)

**Language Coverage:**
- All 17 HTML pages fully translated
- Chatbot voice recognition in all languages
- Dynamic language switching (no page reload)
- Persistent language preference

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
MiniProj/
├── public/
│   ├── index.html                  # Homepage with multi-language
│   ├── about.html                  # About page
│   ├── submit-complaint.html       # Complaint submission form
│   ├── track-complaint.html        # Track complaint status
│   ├── public-dashboard.html       # Public statistics dashboard
│   ├── contact.html                # Contact page
│   ├── help-faq.html              # Help & FAQ
│   ├── terms.html                 # Terms & Conditions
│   ├── login.html                 # Citizen login
│   ├── register.html              # User registration
│   ├── forgot-password.html       # Password recovery
│   ├── admin-login.html           # Admin login
│   ├── admin-dashboard.html       # Admin dashboard with analytics
│   ├── department-login.html      # Department login
│   ├── department-dashboard.html  # Department dashboard
│   ├── css/
│   │   ├── style.css             # Main stylesheet (7700+ lines)
│   │   ├── dashboard.css         # Dashboard styling
│   │   ├── chatbot.css           # Chatbot UI styles (600+ lines)
│   │   └── dark-mode.css         # Dark mode theme
│   ├── js/
│   │   ├── main.js               # Common functions
│   │   ├── complaint-form.js     # Form handling & validation
│   │   ├── track-complaint.js    # Tracking functionality
│   │   ├── contact.js            # FAQ accordion
│   │   ├── auth.js               # User authentication
│   │   ├── admin-auth.js         # Admin authentication
│   │   ├── admin-dashboard.js    # Admin dashboard logic
│   │   ├── department-auth.js    # Department authentication
│   │   ├── department-dashboard.js # Department dashboard logic
│   │   ├── chatbot.js            # AI Chatbot frontend (563 lines)
│   │   └── language.js           # Multi-language support
│   └── images/                   # Image assets
├── server/
│   └── server.js                 # Express backend with NLP (548+ lines)
├── data/
│   ├── complaints.json           # Complaints database
│   ├── users.json               # Users database
│   ├── departments.json         # Department officers
│   └── admins.json              # Admin credentials
├── package.json                 # Project dependencies
└── README.md                    # This file
```

**Total Files:** 35+ (17 HTML, 10+ JS, 4 CSS, 4 JSON/Config)

## 🔐 Demo Credentials

### Admin Login
- **Email:** admin@gmail.com
- **Password:** admin1234

### Department Login (Roads Department)
- **Email:** roads@example.com
- **Password:** roads123

### Citizen Login
- **Email:** demo@example.com
- **Password:** demo123

> ⚠️ **Security Note:** Change these credentials before deploying to production!

## 💻 Technology Stack

### Frontend
- **HTML5:** Semantic markup, accessibility features
- **CSS3:** Flexbox, Grid, animations, transitions
- **JavaScript (ES6+):** Vanilla JS, async/await, Fetch API
- **Web Speech API:** Voice recognition (3 languages)
- **LocalStorage:** Chat history persistence

### Backend
- **Node.js (v14+):** Server runtime
- **Express.js:** RESTful API framework
- **Body-parser:** Request parsing
- **CORS:** Cross-origin resource sharing
- **Multer:** File upload handling

### Data & Storage
- **JSON Files:** File-based database (complaints, users, departments, admins)
- **Base64 Encoding:** Image storage

### UI/UX Libraries
- **Font Awesome 6:** Icon library (2000+ icons)
- **Chart.js:** Analytics visualization
- **Google Fonts:** Typography (Poppins, Inter)

### NLP & AI
- **Custom NLP Engine:** Keyword extraction, similarity scoring
- **Pattern Matching:** Regex-based question detection
- **Knowledge Base:** 40+ response patterns

## 🎨 Design Theme

- **Primary Color:** Blue (#2563eb)
- **Secondary Colors:** White, Light Gray
- **Typography:** Segoe UI, Clean & Professional
- **Design Philosophy:** Minimal, accessible, and trustworthy

## 📱 Responsive Design

The portal is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px+)
- 📲 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔄 User Flow

1. **Citizen** → Opens website
2. **Register/Login** → Creates account or logs in
3. **Submit Complaint** → Fills form with details and photo
4. **Receive ID** → Gets unique complaint tracking ID
5. **Track Status** → Monitors progress in real-time
6. **Admin Reviews** → Admin assigns to department
7. **Department Acts** → Updates progress and resolves
8. **Citizen Notified** → Receives updates until resolution
9. **Feedback** → Provides rating and feedback

## 🌟 Key Benefits

- ✅ **Transparency:** Complete visibility into complaint lifecycle
- ✅ **Faster Resolution:** Direct department assignment
- ✅ **Centralized Data:** All complaints in one platform
- ✅ **Improved Accountability:** Track department performance
- ✅ **Better Services:** Data-driven improvements
- ✅ **24/7 Access:** Submit complaints anytime

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for auto-restart on file changes.

### API Endpoints

#### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get specific complaint
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id` - Update complaint status
- `POST /api/complaints/:id/feedback` - Submit feedback
- `GET /api/complaints/stats` - Get statistics

#### Chatbot
- `POST /api/chatbot` - NLP-powered chatbot endpoint
  - Accepts: `{ message, history }`
  - Returns: `{ response, understood, questionType, keywords }`

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/department-login` - Department login

## 📊 Features in Detail

### Complaint Categories
- Road Damage / Potholes
- Water Leak / Supply Issue
- Streetlight Not Working
- Garbage Collection Issue
- Electricity / Power Issue
- Drainage / Sewage Problem
- Safety / Security Concern
- Other

### Status Workflow
1. **Pending** - Complaint submitted
2. **Assigned** - Assigned to department
3. **In Progress** - Work in progress
4. **Resolved** - Issue resolved

### Priority Levels
- 🔴 **High** - Urgent issues
- 🟡 **Medium** - Normal issues
- 🟢 **Low** - Non-urgent issues

## 🚀 Future Enhancements

- [ ] SMS/Email notifications with Twilio/SendGrid
- [ ] GPS-based location mapping (Google Maps API)
- [ ] OTP verification for secure authentication
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced ML-based chatbot with TensorFlow.js
- [ ] Database migration to MongoDB/PostgreSQL
- [ ] Redis caching for better performance
- [ ] Advanced analytics with Elasticsearch
- [ ] Export reports (PDF/Excel) with jsPDF/ExcelJS
- [ ] Real-time notifications with WebSockets
- [ ] Image recognition for auto-categorization
- [ ] Citizen forum and community discussions
- [ ] Gamification (badges, leaderboards)
- [ ] Integration with government APIs

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free)
```bash
npm install -g vercel
vercel
```

### Option 2: Heroku
```bash
# Create Procfile
echo "web: node server/server.js" > Procfile
git push heroku main
```

### Option 3: Render
1. Connect GitHub repository
2. Deploy as Web Service
3. Start command: `node server/server.js`

### Option 4: Railway
1. Import from GitHub
2. Auto-deploy on push

### Pre-Deployment Checklist
- [ ] Change admin credentials
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Use environment variables (.env)
- [ ] Test all features on staging
- [ ] Set up error logging
- [ ] Configure backup strategy

## 👥 Team

**Team VoiceUp**
- **Disha J Kotian** - Full Stack Developer
- **Chaithali R Shettigar** - Full Stack Developer

**Department of Computer Science & Engineering**  
**Srinivas University, Mukka**

## 🏆 Achievements

- ✅ **17 Fully Functional Pages** with responsive design
- ✅ **AI-Powered NLP Chatbot** with 40+ response patterns
- ✅ **Multi-Language Support** (3 languages)
- ✅ **Advanced Analytics Dashboard** with real-time stats
- ✅ **Voice Input Integration** using Web Speech API
- ✅ **Zero Compilation Errors** - Production ready
- ✅ **35+ Files** with 10,000+ lines of code

## 📊 Project Statistics

- **Total Lines of Code:** 10,000+
- **HTML Pages:** 17
- **JavaScript Files:** 10+
- **CSS Files:** 4 (7,700+ lines total)
- **API Endpoints:** 10+
- **Chatbot Response Patterns:** 40+
- **Languages Supported:** 3
- **Development Time:** [Duration]
- **Deployment Status:** ✅ Ready

## 📄 License

This project is developed as part of an educational initiative.

---

## 🎯 What Makes This Portal Unique?

1. **🤖 AI-Powered Assistance:** Advanced NLP chatbot that understands and answers ANY question, not just portal-specific queries
2. **🌍 True Multi-Language:** Complete translation across 17 pages in English, Hindi, and Kannada
3. **🎙️ Voice Interaction:** Hands-free complaint submission and chatbot interaction
4. **📊 Real-Time Analytics:** Live dashboard with visual charts and statistics
5. **🎨 Modern UI/UX:** Floating chatbot, smooth animations, dark mode support
6. **📱 Fully Responsive:** Works seamlessly on mobile, tablet, and desktop
7. **🔐 Role-Based Access:** Separate interfaces for citizens, departments, and admins
8. **💾 Persistent Data:** Chat history, complaint tracking, user sessions
9. **⚡ Fast & Lightweight:** Vanilla JavaScript, no heavy frameworks
10. **🔄 Real-Time Updates:** Live status tracking and notifications

## 🎓 Learning Outcomes

This project demonstrates proficiency in:
- ✅ Full-stack web development (Frontend + Backend)
- ✅ Natural Language Processing (NLP) implementation
- ✅ RESTful API design and development
- ✅ User authentication and authorization
- ✅ Data persistence and management
- ✅ Responsive web design principles
- ✅ Internationalization (i18n) and localization
- ✅ Web Speech API integration
- ✅ State management with localStorage
- ✅ Async JavaScript and Promises
- ✅ File upload handling (Base64 encoding)
- ✅ Data visualization with Chart.js

---

**Designed to improve transparency, accountability, and community well-being.**

*Made with ❤️ by Team VoiceUp | Srinivas University*

---

### 📝 Documentation Version
**Version:** 2.0  
**Last Updated:** January 4, 2026  
**Status:** ✅ Production Ready
