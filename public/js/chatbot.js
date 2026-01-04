// Enhanced Chatbot functionality with real-time features
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        this.typingTimeout = null;
        this.suggestions = [];
        this.chatHistory = this.loadChatHistory();
        this.isVoiceEnabled = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.recognition = null;
        this.isListening = false;
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.attachEventListeners();
        this.loadPreviousChats();
        this.addWelcomeMessage();
        this.setupVoiceRecognition();
        this.startSmartSuggestions();
        
        // Make chatbot instance globally available
        window.chatbotInstance = this;
    }

    loadChatHistory() {
        try {
            const history = localStorage.getItem('chatHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            return [];
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(this.messages.slice(-50))); // Keep last 50 messages
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadPreviousChats() {
        if (this.chatHistory.length > 0) {
            // Show last 5 messages from history
            this.chatHistory.slice(-5).forEach(msg => {
                this.addMessage(msg.text, msg.sender, false);
            });
        }
    }

    setupVoiceRecognition() {
        if (!this.isVoiceEnabled) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.currentLanguage === 'kn' ? 'kn-IN' : this.currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chatbotInput');
            input.value = transcript;
            this.isListening = false;
            this.updateVoiceButton();
        };

        this.recognition.onerror = () => {
            this.isListening = false;
            this.updateVoiceButton();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton();
        };
    }

    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.classList.toggle('listening', this.isListening);
            voiceBtn.innerHTML = this.isListening ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) return;

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
            this.isListening = true;
            this.updateVoiceButton();
        }
    }

    startSmartSuggestions() {
        const input = document.getElementById('chatbotInput');
        if (!input) return;

        input.addEventListener('input', () => {
            this.handleInputChange(input.value);
        });
    }

    handleInputChange(value) {
        clearTimeout(this.typingTimeout);
        
        if (value.length > 2) {
            this.typingTimeout = setTimeout(() => {
                this.showSuggestions(value);
            }, 300);
        } else {
            this.hideSuggestions();
        }
    }

    showSuggestions(input) {
        const suggestions = this.getSmartSuggestions(input.toLowerCase());
        const container = document.getElementById('suggestionsList');
        
        if (!container || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        container.innerHTML = suggestions.map(s => 
            `<div class="suggestion-item" data-text="${s}">${s}</div>`
        ).join('');

        container.style.display = 'block';

        // Add click handlers
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('chatbotInput').value = item.dataset.text;
                this.hideSuggestions();
            });
        });
    }

    hideSuggestions() {
        const container = document.getElementById('suggestionsList');
        if (container) {
            container.style.display = 'none';
        }
    }

    getSmartSuggestions(input) {
        const commonQueries = {
            en: [
                'How to submit a complaint?',
                'How to track my complaint status?',
                'What are the complaint categories?',
                'How long does it take to resolve?',
                'How can I contact support?',
                'What is the priority system?',
                'How to check the public dashboard?',
                'Can I attach photos to my complaint?',
                'How to update my complaint?',
                'What are the working hours?'
            ],
            kn: [
                'ದೂರು ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?',
                'ನನ್ನ ದೂರು ಸ್ಥಿತಿ ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?',
                'ದೂರು ವರ್ಗಗಳು ಯಾವುವು?',
                'ಪರಿಹರಿಸಲು ಎಷ್ಟು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ?',
                'ನಾನು ಬೆಂಬಲವನ್ನು ಹೇಗೆ ಸಂಪರ್ಕಿಸಬಹುದು?'
            ],
            hi: [
                'शिकायत कैसे दर्ज करें?',
                'मेरी शिकायत की स्थिति कैसे ट्रैक करें?',
                'शिकायत की श्रेणियां क्या हैं?',
                'समाधान में कितना समय लगता है?',
                'मैं सहायता से कैसे संपर्क कर सकता हूं?'
            ]
        };

        const queries = commonQueries[this.currentLanguage] || commonQueries.en;
        return queries.filter(q => q.toLowerCase().includes(input)).slice(0, 5);
    }

    exportChat() {
        const chatText = this.messages.map(msg => 
            `[${msg.time}] ${msg.sender.toUpperCase()}: ${msg.text}`
        ).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearChat() {
        const confirmTexts = {
            en: 'Are you sure you want to clear all chat history?',
            kn: 'ನೀವು ಎಲ್ಲಾ ಚಾಟ್ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?',
            hi: 'क्या आप सभी चैट इतिहास को साफ़ करना चाहते हैं?'
        };

        if (confirm(confirmTexts[this.currentLanguage] || confirmTexts.en)) {
            this.messages = [];
            document.getElementById('chatbotMessages').innerHTML = '';
            localStorage.removeItem('chatHistory');
            this.addWelcomeMessage();
        }
    }
    
    updateLanguage(lang) {
        this.currentLanguage = lang;
        this.updateUI();
        // Add language change notification
        const messages = {
            en: 'Language changed to English',
            kn: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
            hi: 'भाषा हिंदी में बदली गई'
        };
        this.addMessage(messages[lang] || messages.en, 'bot');
    }
    
    updateUI() {
        const texts = {
            en: {
                title: 'Support Assistant',
                online: 'Online 24/7',
                placeholder: 'Type your message...',
                quickSubmit: 'Submit Complaint',
                quickTrack: 'Track Status',
                quickCategories: 'Categories'
            },
            kn: {
                title: 'ಬೆಂಬಲ ಸಹಾಯಕ',
                online: '24/7 ಆನ್‌ಲೈನ್',
                placeholder: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
                quickSubmit: 'ದೂರು ಸಲ್ಲಿಸಿ',
                quickTrack: 'ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ',
                quickCategories: 'ವರ್ಗಗಳು'
            },
            hi: {
                title: 'सहायता सहायक',
                online: '24/7 ऑनलाइन',
                placeholder: 'अपना संदेश टाइप करें...',
                quickSubmit: 'शिकायत दर्ज करें',
                quickTrack: 'स्थिति जांचें',
                quickCategories: 'श्रेणियां'
            }
        };
        
        const t = texts[this.currentLanguage] || texts.en;
        
        const titleEl = document.querySelector('.chatbot-header-text h3');
        const onlineEl = document.querySelector('.chatbot-header-text p');
        const inputEl = document.getElementById('chatbotInput');
        const quickReplies = document.querySelectorAll('.quick-reply');
        
        if (titleEl) titleEl.textContent = t.title;
        if (onlineEl) onlineEl.textContent = t.online;
        if (inputEl) inputEl.placeholder = t.placeholder;
        
        if (quickReplies.length >= 3) {
            quickReplies[0].textContent = t.quickSubmit;
            quickReplies[1].textContent = t.quickTrack;
            quickReplies[2].textContent = t.quickCategories;
        }
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-container" id="chatbotContainer">
                <button class="chatbot-button" id="chatbotToggle">
                    <i class="fas fa-comments"></i>
                    <span class="chatbot-badge">AI</span>
                </button>
                
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <div class="chatbot-avatar">
                                <i class="fas fa-robot"></i>
                                <span class="status-dot"></span>
                            </div>
                            <div class="chatbot-header-text">
                                <h3>Support Assistant</h3>
                                <p><span class="status-text">Online 24/7</span> • <span class="ai-tag">AI Powered</span></p>
                            </div>
                        </div>
                        <div class="chatbot-actions">
                            <button class="chatbot-action-btn" id="exportChat" title="Export Chat">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="chatbot-action-btn" id="clearChat" title="Clear Chat">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <button class="chatbot-close" id="chatbotClose">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbotMessages">
                        <!-- Messages will be inserted here -->
                    </div>
                    
                    <div class="chatbot-suggestions" id="suggestionsList" style="display: none;">
                        <!-- Smart suggestions will appear here -->
                    </div>
                    
                    <div class="chatbot-quick-actions">
                        <div class="quick-actions-header">
                            <span>Quick Actions</span>
                        </div>
                        <div class="quick-actions-grid">
                            <button class="quick-action-card" data-action="submit">
                                <i class="fas fa-plus-circle"></i>
                                <span>Submit Complaint</span>
                            </button>
                            <button class="quick-action-card" data-action="track">
                                <i class="fas fa-search"></i>
                                <span>Track Status</span>
                            </button>
                            <button class="quick-action-card" data-action="categories">
                                <i class="fas fa-th-large"></i>
                                <span>Categories</span>
                            </button>
                            <button class="quick-action-card" data-action="help">
                                <i class="fas fa-question-circle"></i>
                                <span>Help</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="chatbot-input-container">
                        <div class="chatbot-input">
                            ${this.isVoiceEnabled ? '<button class="voice-btn" id="voiceBtn" title="Voice Input"><i class="fas fa-microphone"></i></button>' : ''}
                            <input type="text" id="chatbotInput" placeholder="Type your message..." autocomplete="off">
                            <button class="chatbot-send" id="chatbotSend">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="chatbot-footer">
                            <span class="powered-by">Powered by AI • Real-time responses</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbotToggle');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const voiceBtn = document.getElementById('voiceBtn');
        const exportBtn = document.getElementById('exportChat');
        const clearBtn = document.getElementById('clearChat');
        const quickActions = document.querySelectorAll('.quick-action-card');

        toggleBtn?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.toggleChat());
        sendBtn?.addEventListener('click', () => this.sendMessage());
        voiceBtn?.addEventListener('click', () => this.toggleVoiceInput());
        exportBtn?.addEventListener('click', () => this.exportChat());
        clearBtn?.addEventListener('click', () => this.clearChat());

        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick action buttons
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Click outside suggestions to hide
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#chatbotInput') && !e.target.closest('#suggestionsList')) {
                this.hideSuggestions();
            }
        });
    }

    handleQuickAction(action) {
        const messages = {
            submit: {
                en: 'How to submit a complaint?',
                kn: 'ದೂರು ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?',
                hi: 'शिकायत कैसे दर्ज करें?'
            },
            track: {
                en: 'How to track my complaint status?',
                kn: 'ನನ್ನ ದೂರು ಸ್ಥಿತಿ ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?',
                hi: 'मेरी शिकायत की स्थिति कैसे ट्रैक करें?'
            },
            categories: {
                en: 'What are the complaint categories?',
                kn: 'ದೂರು ವರ್ಗಗಳು ಯಾವುವು?',
                hi: 'शिकायत की श्रेणियां क्या हैं?'
            },
            help: {
                en: 'I need help with the portal',
                kn: 'ಪೋರ್ಟಲ್ನೊಂದಿಗೆ ನನಗೆ ಸಹಾಯ ಬೇಕು',
                hi: 'मुझे पोर्टल में मदद चाहिए'
            }
        };

        const message = messages[action]?.[this.currentLanguage] || messages[action]?.en;
        if (message) {
            this.sendMessage(message);
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        const button = document.getElementById('chatbotToggle');

        if (this.isOpen) {
            window.classList.add('active');
            button.classList.add('active');
            setTimeout(() => {
                document.getElementById('chatbotInput')?.focus();
            }, 300);
        } else {
            window.classList.remove('active');
            button.classList.remove('active');
            this.hideSuggestions();
        }
    }

    addWelcomeMessage() {
        const welcomeMessages = {
            en: '👋 Hello! I\'m your **AI-powered** support assistant. I can help you with:\n\n✓ Submitting complaints\n✓ Tracking status\n✓ Understanding categories\n✓ General queries\n\nHow can I assist you today?',
            kn: '👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ **AI-ಚಾಲಿತ** ಬೆಂಬಲ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n\n✓ ದೂರುಗಳನ್ನು ಸಲ್ಲಿಸುವುದು\n✓ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು\n✓ ವರ್ಗಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು\n✓ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು\n\nಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
            hi: '👋 नमस्ते! मैं आपका **AI-संचालित** सहायता सहायक हूं। मैं आपकी मदद कर सकता हूं:\n\n✓ शिकायतें दर्ज करना\n✓ स्थिति ट्रैक करना\n✓ श्रेणियों को समझना\n✓ सामान्य प्रश्न\n\nआज मैं आपकी कैसे सहायता कर सकता हूं?'
        };
        this.addMessage(welcomeMessages[this.currentLanguage] || welcomeMessages.en, 'bot', false);
    }

    async sendMessage(text = null) {
        const input = document.getElementById('chatbotInput');
        const message = text || input.value.trim();

        if (!message) return;

        this.hideSuggestions();
        this.addMessage(message, 'user');
        input.value = '';

        const sendBtn = document.getElementById('chatbotSend');
        if (sendBtn) sendBtn.disabled = true;

        await this.delay(500);
        this.showTyping();

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    language: this.currentLanguage,
                    history: this.messages.slice(-5)
                })
            });

            const data = await response.json();
            await this.delay(800);
            this.hideTyping();

            if (data.success) {
                this.addMessage(data.response, 'bot');
            } else {
                const errorMsg = {
                    en: 'Sorry, I encountered an error. Please try again.',
                    kn: 'ಕ್ಷಮಿಸಿ, ನನಗೆ ದೋಷ ಎದುರಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
                    hi: 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुन: प्रयास करें।'
                };
                this.addMessage(errorMsg[this.currentLanguage] || errorMsg.en, 'bot');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            const errorMsg = {
                en: '⚠️ Connection error. Please check your internet and try again.',
                kn: '⚠️ ಸಂಪರ್ಕ ದೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ.',
                hi: '⚠️ कनेक्शन त्रुटि। कृपया अपना इंटरनेट जांचें।'
            };
            this.addMessage(errorMsg[this.currentLanguage] || errorMsg.en, 'bot');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addMessage(text, sender, save = true) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const messageHTML = `
            <div class="chatbot-message ${sender}" style="animation: slideInMessage 0.3s ease;">
                <div class="message-avatar">
                    <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble">${this.formatMessage(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (save) {
            this.messages.push({ text, sender, time });
            this.saveChatHistory();
        }
    }

    formatMessage(text) {
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        return text;
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingHTML = `
            <div class="chatbot-message bot" id="typingIndicator">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-typing">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Chatbot();
    });
} else {
    new Chatbot();
}
