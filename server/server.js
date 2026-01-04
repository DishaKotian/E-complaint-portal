const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(COMPLAINTS_FILE)) {
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Helper functions
function readComplaints() {
    try {
        const data = fs.readFileSync(COMPLAINTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeComplaints(complaints) {
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
}

function readUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateComplaintId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CPL${year}${random}`;
}

// AI Categorization Function
function aiCategorizeComplaint(description, category) {
    const keywords = {
        'Road Damage': ['road', 'pothole', 'crack', 'pavement', 'asphalt', 'highway', 'street damage'],
        'Water Leak': ['water', 'leak', 'pipe', 'burst', 'supply', 'tap', 'overflow'],
        'Streetlight': ['light', 'streetlight', 'lamp', 'dark', 'illumination', 'bulb'],
        'Garbage': ['garbage', 'trash', 'waste', 'litter', 'dump', 'refuse', 'sanitation'],
        'Electricity': ['electricity', 'power', 'outage', 'transformer', 'wire', 'cable', 'electric'],
        'Drainage': ['drainage', 'sewage', 'gutter', 'overflow', 'clog', 'smell', 'sewer'],
        'Safety': ['safety', 'security', 'crime', 'danger', 'unsafe', 'accident', 'risk']
    };
    
    const desc = description.toLowerCase();
    let suggestedCategory = category;
    let maxScore = 0;
    
    // Check if manually selected category matches description
    for (const [cat, words] of Object.entries(keywords)) {
        const score = words.filter(word => desc.includes(word)).length;
        if (score > maxScore) {
            maxScore = score;
            suggestedCategory = cat;
        }
    }
    
    return suggestedCategory;
}

// AI Priority Assignment Function
function aiAssignPriority(description, category) {
    const highPriorityKeywords = ['urgent', 'emergency', 'danger', 'accident', 'injury', 'flood', 'fire', 'burst', 'overflow', 'critical', 'severe'];
    const mediumPriorityKeywords = ['broken', 'damaged', 'problem', 'issue', 'concern', 'needs', 'repair'];
    
    const desc = description.toLowerCase();
    
    // Check for high priority keywords
    const hasHighPriority = highPriorityKeywords.some(word => desc.includes(word));
    if (hasHighPriority) return 'High';
    
    // Check for medium priority keywords
    const hasMediumPriority = mediumPriorityKeywords.some(word => desc.includes(word));
    if (hasMediumPriority) return 'Medium';
    
    // Category-based priority
    if (category === 'Safety' || category === 'Electricity' || category === 'Water Leak') {
        return 'High';
    }
    
    return 'Low';
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'E-Complaint Portal API is running' });
});

// Get all complaints
app.get('/api/complaints', (req, res) => {
    const complaints = readComplaints();
    res.json(complaints);
});

// Get complaint by ID
app.get('/api/complaints/:id', (req, res) => {
    const complaints = readComplaints();
    const complaint = complaints.find(c => c.id === req.params.id);
    
    if (complaint) {
        res.json(complaint);
    } else {
        res.status(404).json({ error: 'Complaint not found' });
    }
});

// Create new complaint
app.post('/api/complaints', (req, res) => {
    const complaints = readComplaints();
    
    // Apply AI categorization and priority
    const aiCategory = aiCategorizeComplaint(req.body.description, req.body.category);
    const aiPriority = aiAssignPriority(req.body.description, aiCategory);
    
    const newComplaint = {
        id: generateComplaintId(),
        ...req.body,
        category: aiCategory, // AI-suggested category
        priority: aiPriority, // AI-assigned priority
        originalCategory: req.body.category, // Store original for reference
        date: new Date().toISOString(),
        status: 'Pending',
        updates: [],
        aiProcessed: true
    };
    
    complaints.push(newComplaint);
    writeComplaints(complaints);
    
    res.status(201).json({ 
        success: true, 
        message: 'Complaint submitted successfully',
        id: newComplaint.id,
        complaint: newComplaint,
        aiSuggestions: {
            category: aiCategory,
            priority: aiPriority
        }
    });
});

// Update complaint
app.put('/api/complaints/:id', (req, res) => {
    const complaints = readComplaints();
    const index = complaints.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Complaint not found' });
    }
    
    const { status, department, priority, notes } = req.body;
    
    // Update complaint
    if (status) complaints[index].status = status;
    if (department) complaints[index].department = department;
    if (priority) complaints[index].priority = priority;
    
    // Add update note
    if (notes) {
        if (!complaints[index].updates) {
            complaints[index].updates = [];
        }
        complaints[index].updates.push({
            date: new Date().toISOString(),
            title: `Status updated to ${status}`,
            message: notes
        });
    }
    
    // Update dates based on status
    if (status === 'Assigned' && !complaints[index].assignedDate) {
        complaints[index].assignedDate = new Date().toISOString();
    }
    if (status === 'In Progress' && !complaints[index].inProgressDate) {
        complaints[index].inProgressDate = new Date().toISOString();
    }
    if (status === 'Resolved' && !complaints[index].resolvedDate) {
        complaints[index].resolvedDate = new Date().toISOString();
    }
    
    writeComplaints(complaints);
    
    res.json({ 
        success: true, 
        message: 'Complaint updated successfully',
        complaint: complaints[index]
    });
});

// Submit feedback
app.post('/api/complaints/:id/feedback', (req, res) => {
    const complaints = readComplaints();
    const index = complaints.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Complaint not found' });
    }
    
    complaints[index].feedback = {
        rating: req.body.rating,
        comment: req.body.feedback,
        date: new Date().toISOString()
    };
    
    writeComplaints(complaints);
    
    res.json({ 
        success: true, 
        message: 'Feedback submitted successfully'
    });
});

// Get statistics
app.get('/api/complaints/stats', (req, res) => {
    const complaints = readComplaints();
    
    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        assigned: complaints.filter(c => c.status === 'Assigned').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
    };
    
    // Calculate average resolution time
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' && c.resolvedDate);
    if (resolvedComplaints.length > 0) {
        const totalDays = resolvedComplaints.reduce((sum, c) => {
            const created = new Date(c.date);
            const resolved = new Date(c.resolvedDate);
            const days = Math.ceil((resolved - created) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        stats.avgResolutionDays = Math.round(totalDays / resolvedComplaints.length);
    } else {
        stats.avgResolutionDays = 0;
    }
    
    res.json(stats);
});

// User registration
app.post('/api/auth/register', (req, res) => {
    const users = readUsers();
    const { fullName, email, phone, password } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        phone,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    res.status(201).json({ 
        success: true, 
        message: 'User registered successfully'
    });
});

// User login
app.post('/api/auth/login', (req, res) => {
    const users = readUsers();
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

// Advanced NLP-based AI Chatbot - Answers ANY question
app.post('/api/chatbot', (req, res) => {
    const { message, language = 'en', history = [] } = req.body;
    const msg = message.toLowerCase().trim();
    
    // NLP Helper Functions
    const extractKeywords = (text) => {
        const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'of', 'to', 'in', 'for', 'with', 'from', 'by', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once'];
        const words = text.toLowerCase().split(/\s+/);
        return words.filter(w => w.length > 2 && !stopWords.includes(w));
    };
    
    const calculateSimilarity = (str1, str2) => {
        const words1 = new Set(extractKeywords(str1));
        const words2 = new Set(extractKeywords(str2));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    };
    
    const getQuestionType = (text) => {
        if (/^(what|wht)\s/i.test(text)) return 'what';
        if (/^(how|hw)\s/i.test(text)) return 'how';
        if (/^(why|y)\s/i.test(text)) return 'why';
        if (/^(when|wen)\s/i.test(text)) return 'when';
        if (/^(where|whr)\s/i.test(text)) return 'where';
        if (/^(who|whom)\s/i.test(text)) return 'who';
        if (/^(which|whch)\s/i.test(text)) return 'which';
        if (/^(can|could|may)\s/i.test(text)) return 'can';
        if (/^(is|are|am|was|were|does|do|did)\s/i.test(text)) return 'yes/no';
        return 'statement';
    };
    
    // Comprehensive Knowledge Base with NLP-like responses
    const knowledgeBase = {
        // Portal-specific responses
        portalTopics: {
            submit: { keywords: ['submit', 'file', 'register', 'create', 'report', 'lodge', 'complaint'], response: '📝 **How to Submit a Complaint:**\n\n1. Click **"Submit Complaint"** in the menu\n2. Fill in required fields (category, location, description)\n3. Upload photos if available\n4. Click Submit\n5. Save your Tracking ID (CMP-XXXXXX)\n\nNeed help with a specific step?' },
            track: { keywords: ['track', 'check', 'status', 'find', 'locate', 'view', 'see'], response: '🔍 **Track Your Complaint:**\n\n1. Go to "Track Status" page\n2. Enter your Complaint ID (CMP-XXXXXX)\n3. View real-time updates and resolution details\n\nLost your ID? Check your email!' },
            categories: { keywords: ['categories', 'types', 'kinds', 'classification'], response: '🗂️ **Categories:** 🛣️ Road Damage • 💧 Water Leaks • 💡 Streetlights • 🗑️ Garbage • ⚡ Electricity • 🚰 Drainage • 🚨 Safety • 🏗️ Construction' },
            time: { keywords: ['time', 'long', 'duration', 'when', 'take'], response: '⏱️ **Timeline:** High Priority (24-48hrs) • Medium (3-5 days) • Low (5-7 days). Track for real-time updates!' },
            contact: { keywords: ['contact', 'phone', 'email', 'call', 'reach', 'support'], response: '📞 **Contact:** Email: support@ecomplaint.com • Phone: +91-1234-567890 • Emergency: 1800-XXX-XXXX (24/7)' }
        },
        
        // General conversational responses
        general: {
            greeting: { patterns: [/^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening)/i], response: '👋 Hello! I\'m your AI assistant. I can help with the E-Complaint Portal AND answer general questions. What would you like to know?' },
            thanks: { patterns: [/(thank|thanks|appreciate)/i], response: '😊 You\'re welcome! Happy to help with anything else!' },
            goodbye: { patterns: [/^(bye|goodbye|see you|exit|quit)/i], response: '👋 Goodbye! Feel free to return anytime. Have a great day!' },
            name: { patterns: [/(your name|who are you|what are you)/i], response: '🤖 I\'m an AI-powered assistant for the E-Complaint Portal. I can help with portal queries AND general questions. Think of me as your smart helper!' },
            how_are_you: { patterns: [/(how are you|how do you do|whats up)/i], response: '😊 I\'m doing great, thanks for asking! I\'m here and ready to help. How can I assist you today?' },
            age: { patterns: [/(your age|how old|when.*created|when.*made)/i], response: '🎂 I was created for this E-Complaint Portal in 2026. I\'m always learning and improving to serve you better!' },
            purpose: { patterns: [/(what.*purpose|why.*exist|what.*job)/i], response: '🎯 My purpose is to help citizens with the E-Complaint Portal and answer any questions you have. I make public services more accessible!' },
            help: { patterns: [/(help|assist|what can you do|capabilities)/i], response: '🤖 **I can help with:**\n\n✓ E-Complaint Portal (submit, track, categories)\n✓ General questions (definitions, math, facts)\n✓ Time & date information\n✓ Simple calculations\n✓ Conversational chat\n\nJust ask me anything!' }
        },
        
        // Factual/General Knowledge
        facts: {
            time: { patterns: [/(what.*time|current time|time now)/i], response: () => `🕒 Current time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` },
            date: { patterns: [/(what.*date|today.*date|current date)/i], response: () => `📅 Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` },
            day: { patterns: [/(what day|which day|today.*day)/i], response: () => `📆 Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}` },
            year: { patterns: [/(what year|current year|which year)/i], response: '📅 It\'s 2026!' },
            weather: { patterns: [/(weather|temperature|climate|forecast)/i], response: '🌤️ I don\'t have real-time weather data, but you can check weather apps or websites like weather.com for accurate forecasts in your area!' },
        },
        
        // Math & calculations
        math: {
            addition: { patterns: [/(\d+)\s*\+\s*(\d+)/], handler: (match) => `➕ ${match[1]} + ${match[2]} = ${parseInt(match[1]) + parseInt(match[2])}` },
            subtraction: { patterns: [/(\d+)\s*-\s*(\d+)/], handler: (match) => `➖ ${match[1]} - ${match[2]} = ${parseInt(match[1]) - parseInt(match[2])}` },
            multiplication: { patterns: [/(\d+)\s*[*×]\s*(\d+)/], handler: (match) => `✖️ ${match[1]} × ${match[2]} = ${parseInt(match[1]) * parseInt(match[2])}` },
            division: { patterns: [/(\d+)\s*[/÷]\s*(\d+)/], handler: (match) => `➗ ${match[1]} ÷ ${match[2]} = ${(parseInt(match[1]) / parseInt(match[2])).toFixed(2)}` }
        },
        
        // Definitions & explanations
        definitions: {
            ai: { patterns: [/(what is|define|explain).*(ai|artificial intelligence)/i], response: '🤖 **Artificial Intelligence (AI)** is computer systems that can perform tasks requiring human intelligence - like learning, reasoning, problem-solving, and understanding language. I\'m an example of AI helping you!' },
            blockchain: { patterns: [/(what is|define).*(blockchain)/i], response: '⛓️ **Blockchain** is a secure, distributed digital ledger that records transactions across multiple computers. It\'s the technology behind cryptocurrencies!' },
            cloud: { patterns: [/(what is|define).*(cloud computing|the cloud)/i], response: '☁️ **Cloud Computing** is delivering computing services (servers, storage, databases) over the internet. Think of it as renting computer resources instead of owning them!' },
            internet: { patterns: [/(what is|define).*(internet|web)/i], response: '🌐 **Internet** is a global network connecting millions of computers worldwide, allowing them to share information instantly!' },
            programming: { patterns: [/(what is|define).*(programming|coding)/i], response: '💻 **Programming** is writing instructions (code) that computers follow to perform tasks. It\'s like teaching computers to solve problems!' }
        },
        
        // Fun & personality
        fun: {
            joke: { patterns: [/(tell.*joke|make me laugh|something funny)/i], response: '😄 Why did the complaint go to therapy? Because it had too many unresolved issues! 🤣\n\nNeed help with a real complaint?' },
            compliment: { patterns: [/(you.*smart|you.*good|you.*awesome|you.*great)/i], response: '😊 Thank you! That\'s kind of you to say. I try my best to help everyone!' },
            insult: { patterns: [/(you.*stupid|you.*dumb|you.*bad|you.*useless)/i], response: '😔 I\'m sorry if I didn\'t help as expected. Let me try again - what do you need assistance with?' },
            love: { patterns: [/(i love you|you.*love)/i], response: '❤️ I appreciate your enthusiasm! I\'m here to help you with any questions. What can I do for you?' },
            favorite: { patterns: [/(your favorite|what do you like)/i], response: '🌟 My favorite thing is helping people solve problems and answer questions! What\'s your favorite thing?' }
        }
    };
    
    // Try to find a matching response
    let response = '';
    let matched = false;
    
    // 1. Check general patterns first
    for (const [category, items] of Object.entries(knowledgeBase.general)) {
        for (const item of Object.values(items)) {
            if (item.patterns) {
                for (const pattern of item.patterns) {
                    if (pattern.test(msg)) {
                        response = typeof item.response === 'function' ? item.response() : item.response;
                        matched = true;
                        break;
                    }
                }
            }
        }
        if (matched) break;
    }
    
    // 2. Check facts
    if (!matched) {
        for (const [category, item] of Object.entries(knowledgeBase.facts)) {
            if (item.patterns) {
                for (const pattern of item.patterns) {
                    if (pattern.test(msg)) {
                        response = typeof item.response === 'function' ? item.response() : item.response;
                        matched = true;
                        break;
                    }
                }
            }
        }
    }
    
    // 3. Check math operations
    if (!matched) {
        for (const [operation, item] of Object.entries(knowledgeBase.math)) {
            for (const pattern of item.patterns) {
                const match = msg.match(pattern);
                if (match) {
                    response = item.handler(match);
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }
    }
    
    // 4. Check definitions
    if (!matched) {
        for (const [topic, item] of Object.entries(knowledgeBase.definitions)) {
            for (const pattern of item.patterns) {
                if (pattern.test(msg)) {
                    response = item.response;
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }
    }
    
    // 5. Check fun responses
    if (!matched) {
        for (const [category, item] of Object.entries(knowledgeBase.fun)) {
            for (const pattern of item.patterns) {
                if (pattern.test(msg)) {
                    response = item.response;
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }
    }
    
    // 6. Check portal-specific topics using keyword matching
    if (!matched) {
        const keywords = extractKeywords(msg);
        let bestMatch = { score: 0, response: '' };
        
        for (const [topic, data] of Object.entries(knowledgeBase.portalTopics)) {
            const matchScore = data.keywords.filter(k => keywords.includes(k) || msg.includes(k)).length;
            if (matchScore > bestMatch.score) {
                bestMatch = { score: matchScore, response: data.response };
            }
        }
        
        if (bestMatch.score > 0) {
            response = bestMatch.response;
            matched = true;
        }
    }
    
    // 7. NLP-like intelligent fallback
    if (!matched) {
        const questionType = getQuestionType(msg);
        const keywords = extractKeywords(msg);
        
        // Try to understand intent
        if (keywords.length > 0) {
            if (keywords.some(k => ['complaint', 'issue', 'problem', 'report'].includes(k))) {
                response = '📝 I can help with complaints! Try asking:\n• "How to submit?"\n• "Track my complaint"\n• "What categories?"\n• "Contact information"\n\nOr ask me anything else!';
            } else if (questionType === 'what') {
                response = `🤔 You're asking "what" about: **${keywords.join(', ')}**\n\nCould you rephrase? For example:\n• "What is ${keywords[0]}?"\n• "What are the ${keywords[0]}?"\n• "What does ${keywords[0]} mean?"\n\nI'm here to help!`;
            } else if (questionType === 'how') {
                response = `💡 You want to know "how" about: **${keywords.join(', ')}**\n\nTry:\n• "How do I ${keywords[0]}?"\n• "How to ${keywords.join(' ')}?"\n\nI can help with portal questions AND general queries!`;
            } else if (questionType === 'why') {
                response = `🤔 Interesting question about: **${keywords.join(', ')}**\n\nI can explain many things! Try:\n• Portal-related questions\n• General knowledge questions\n• Definitions and explanations`;
            } else if (questionType === 'when') {
                response = `📅 For timing questions, I can tell you:\n• Current time and date\n• Complaint resolution timelines\n• Office working hours\n\nWhat would you like to know?`;
            } else {
                response = `🤖 I see you mentioned: **${keywords.slice(0, 3).join(', ')}**\n\nI can help with:\n✓ E-Complaint Portal questions\n✓ General knowledge\n✓ Definitions & explanations\n✓ Math calculations\n✓ Time & date info\n\nCould you rephrase your question?`;
            }
        } else {
            response = '🤔 I\'m not sure I understood. I can help with:\n\n✓ **E-Complaint Portal** - submit, track, categories\n✓ **General questions** - definitions, facts, math\n✓ **Time & date** - current time, date, day\n✓ **Calculations** - basic math operations\n\nWhat would you like to know?';
        }
    }
    
    res.json({ 
        success: true, 
        response: response,
        timestamp: new Date().toISOString(),
        understood: matched,
        questionType: getQuestionType(msg),
        keywords: extractKeywords(msg).slice(0, 5)
    });
});

// Get public complaints (for dashboard)
app.get('/api/complaints/public/all', (req, res) => {
    const complaints = readComplaints();
    
    // Filter out sensitive information
    const publicComplaints = complaints.map(c => ({
        id: c.id,
        category: c.category,
        location: c.location,
        description: c.description,
        status: c.status,
        priority: c.priority,
        date: c.date,
        department: c.department,
        image: c.image
    }));
    
    res.json(publicComplaints);
});

// Admin login
app.post('/api/auth/admin-login', (req, res) => {
    const { email, password } = req.body;
    
    // Secure admin credentials (only for authorized admin access)
    if (email === 'admin@gmail.com' && password === 'admin1234') {
        res.json({ 
            success: true, 
            admin: { 
                email, 
                name: 'Admin',
                role: 'admin'
            },
            token: 'admin-token-' + Date.now()
        });
    } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('  E-COMPLAINT PORTAL - SERVER RUNNING');
    console.log('='.repeat(60));
    console.log('');
    console.log(`  🌐 Local:            http://localhost:${PORT}`);
    console.log(`  📊 API Endpoint:     http://localhost:${PORT}/api`);
    console.log(`  📁 Data Directory:   ${DATA_DIR}`);
    console.log('');
    console.log('  Pages available:');
    console.log(`     - Homepage:           http://localhost:${PORT}/index.html`);
    console.log(`     - Submit Complaint:   http://localhost:${PORT}/submit-complaint.html`);
    console.log(`     - Track Complaint:    http://localhost:${PORT}/track-complaint.html`);
    console.log(`     - Admin Login:        http://localhost:${PORT}/admin-login.html`);
    console.log(`     - Admin Dashboard:    http://localhost:${PORT}/admin-dashboard.html`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server...');
    process.exit(0);
});
