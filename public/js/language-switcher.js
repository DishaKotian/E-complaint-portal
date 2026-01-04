// Language Switcher for E-Complaint Portal
class LanguageSwitcher {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.init();
    }

    // Detect language from browser or localStorage
    detectLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && ['en', 'kn', 'hi'].includes(savedLang)) {
            return savedLang;
        }
        
        // Try to detect from browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            const langCode = browserLang.toLowerCase();
            if (langCode.startsWith('kn')) return 'kn';
            if (langCode.startsWith('hi')) return 'hi';
        }
        
        // Default to English
        return 'en';
    }

    init() {
        this.createLanguageSelector();
        this.applyTranslations();
        this.attachEventListeners();
        this.addTransitionEffect();
    }

    createLanguageSelector() {
        // Find navigation menu
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) return;

        // Language info with flags
        const languages = {
            en: { name: 'English', flag: '🇬🇧', native: 'English' },
            kn: { name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
            hi: { name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' }
        };

        // Create enhanced language selector HTML
        const langSelector = document.createElement('li');
        langSelector.className = 'language-selector';
        langSelector.innerHTML = `
            <div class="lang-dropdown">
                <button class="lang-dropdown-btn" id="langDropdownBtn">
                    <i class="fas fa-globe"></i>
                    <span class="lang-label">Language</span>
                    <span class="lang-flag">${languages[this.currentLanguage].flag}</span>
                    <span class="lang-name">${languages[this.currentLanguage].native}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="lang-dropdown-menu" id="langDropdownMenu">
                    ${Object.entries(languages).map(([code, lang]) => `
                        <div class="lang-option ${code === this.currentLanguage ? 'active' : ''}" data-lang="${code}">
                            <span class="lang-flag">${lang.flag}</span>
                            <div class="lang-info">
                                <span class="lang-native">${lang.native}</span>
                                <span class="lang-english">${lang.name}</span>
                            </div>
                            ${code === this.currentLanguage ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Insert before login button
        const loginButton = navMenu.querySelector('.btn-login');
        if (loginButton && loginButton.parentElement) {
            navMenu.insertBefore(langSelector, loginButton.parentElement);
        } else {
            navMenu.appendChild(langSelector);
        }
    }

    attachEventListeners() {
        const dropdownBtn = document.getElementById('langDropdownBtn');
        const dropdownMenu = document.getElementById('langDropdownMenu');
        const langOptions = document.querySelectorAll('.lang-option');

        if (dropdownBtn && dropdownMenu) {
            // Toggle dropdown
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
                dropdownBtn.querySelector('.fa-chevron-down').classList.toggle('rotate');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                dropdownBtn.querySelector('.fa-chevron-down').classList.remove('rotate');
            });

            // Language option click
            langOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = option.dataset.lang;
                    if (lang !== this.currentLanguage) {
                        this.changeLanguage(lang);
                    }
                    dropdownMenu.classList.remove('show');
                    dropdownBtn.querySelector('.fa-chevron-down').classList.remove('rotate');
                });
            });
        }
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // Add transition effect
        document.body.classList.add('lang-transitioning');
        
        setTimeout(() => {
            this.applyTranslations();
            this.updateDropdownButton();
            
            // Update chatbot if exists
            if (window.chatbotInstance) {
                window.chatbotInstance.updateLanguage(lang);
            }
            
            // Remove transition effect
            setTimeout(() => {
                document.body.classList.remove('lang-transitioning');
            }, 300);
        }, 150);
    }

    updateDropdownButton() {
        const languages = {
            en: { name: 'English', flag: '🇬🇧', native: 'English' },
            kn: { name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
            hi: { name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' }
        };

        const dropdownBtn = document.getElementById('langDropdownBtn');
        if (dropdownBtn) {
            dropdownBtn.innerHTML = `
                <i class="fas fa-globe"></i>
                <span class="lang-label">Language</span>
                <span class="lang-flag">${languages[this.currentLanguage].flag}</span>
                <span class="lang-name">${languages[this.currentLanguage].native}</span>
                <i class="fas fa-chevron-down"></i>
            `;
        }

        // Update active state in menu
        document.querySelectorAll('.lang-option').forEach(option => {
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
                if (!option.querySelector('.fa-check')) {
                    option.innerHTML += '<i class="fas fa-check"></i>';
                }
            } else {
                option.classList.remove('active');
                const checkIcon = option.querySelector('.fa-check');
                if (checkIcon) checkIcon.remove();
            }
        });
    }

    addTransitionEffect() {
        // Add CSS for smooth transitions
        if (!document.getElementById('lang-transition-styles')) {
            const style = document.createElement('style');
            style.id = 'lang-transition-styles';
            style.textContent = `
                .lang-transitioning [data-i18n] {
                    animation: langFade 0.3s ease;
                }
                
                @keyframes langFade {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.hasAttribute('data-i18n-attr')) {
                    const attr = element.getAttribute('data-i18n-attr');
                    element.setAttribute(attr, translation);
                } else {
                    // For elements with children (like buttons with icons), only update text nodes
                    if (element.children.length > 0 && element.querySelector('i')) {
                        // Has icon children, update only the text
                        const textNode = Array.from(element.childNodes).find(node => node.nodeType === 3);
                        if (textNode) {
                            textNode.textContent = ' ' + translation;
                        } else {
                            // Add text node after icon
                            element.appendChild(document.createTextNode(' ' + translation));
                        }
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
        
        // Handle placeholder translations
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update select options
        this.updateSelectOptions();
    }

    updateSelectOptions() {
        // Update ALL select dropdowns that have data-i18n attributes
        const allSelects = document.querySelectorAll('select');
        allSelects.forEach(select => {
            const currentValue = select.value;
            const options = select.querySelectorAll('option');
            
            options.forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = this.getTranslation(key);
                }
            });
            
            select.value = currentValue;
        });
        
        // Update dashboard dynamically generated content if present
        if (typeof displayComplaints === 'function' && window.filteredComplaints) {
            displayComplaints(window.filteredComplaints);
        }
    }

    getTranslation(key) {
        if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
            return translations[this.currentLanguage][key];
        }
        return translations['en'][key] || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize language switcher when DOM is ready
let languageSwitcher;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        languageSwitcher = new LanguageSwitcher();
    });
} else {
    languageSwitcher = new LanguageSwitcher();
}
