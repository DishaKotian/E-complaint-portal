// Main JavaScript - Common functionality across all pages

// Page Loader
window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 300);
    }
});

// Create and inject page loader
document.addEventListener('DOMContentLoaded', function() {
    // Add page loader HTML
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">Loading...</div>
        </div>
    `;
    document.body.insertBefore(loader, document.body.firstChild);

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!event.target.closest('.navbar')) {
                navMenu.classList.remove('active');
            }
        }
    });
    
    // Load stats on homepage
    if (document.getElementById('totalComplaints')) {
        loadHomeStats();
    }

    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize scroll to top button
    initScrollToTop();
    
    // Add page transition effect
    document.body.classList.add('page-transition');
    
    // Smooth link transitions
    initSmoothTransitions();
    
    // Initialize interactive elements
    initInteractiveElements();
});

// Scroll Animations
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.problem-card, .benefit-card, .process-step, .value-card, .impact-stat, .team-member, .faq-item, .contact-method, .help-card');
    
    reveals.forEach((element, index) => {
        element.classList.add('reveal');
        element.style.transitionDelay = `${index * 0.1}s`;
    });
    
    const revealOnScroll = () => {
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    };
    
    // Initial check
    revealOnScroll();
    
    // Check on scroll with throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            revealOnScroll();
        });
    });
}

// Scroll to Top Button
function initScrollToTop() {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth Page Transitions
function initSmoothTransitions() {
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not(.no-transition)');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's an external link or special action
            if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
                return;
            }
            
            // Skip if it's the current page
            if (href === window.location.pathname || href === window.location.pathname.split('/').pop()) {
                return;
            }
            
            e.preventDefault();
            
            // Add fade out animation
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
}

// Interactive Elements
function initInteractiveElements() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroImage = hero.querySelector('.hero-illustration');
            if (heroImage) {
                heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }
    
    // Hover effect for cards with tilt
    const cards = document.querySelectorAll('.problem-card, .benefit-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);


// Load statistics for homepage
async function loadHomeStats() {
    try {
        const response = await fetch('http://localhost:3000/api/complaints/stats');
        const stats = await response.json();
        
        document.getElementById('totalComplaints').textContent = stats.total || 0;
        document.getElementById('resolvedComplaints').textContent = stats.resolved || 0;
        document.getElementById('inProgressComplaints').textContent = stats.inProgress || 0;
        document.getElementById('avgResolutionTime').textContent = stats.avgResolutionDays || 0;
        
        // Animate numbers
        animateNumber('totalComplaints', stats.total || 0);
        animateNumber('resolvedComplaints', stats.resolved || 0);
        animateNumber('inProgressComplaints', stats.inProgress || 0);
        animateNumber('avgResolutionTime', stats.avgResolutionDays || 0);
    } catch (error) {
        console.log('Stats will load when server is running');
        // Set demo data
        const demoStats = { total: 150, resolved: 120, inProgress: 25, avgResolutionDays: 5 };
        document.getElementById('totalComplaints').textContent = demoStats.total;
        document.getElementById('resolvedComplaints').textContent = demoStats.resolved;
        document.getElementById('inProgressComplaints').textContent = demoStats.inProgress;
        document.getElementById('avgResolutionTime').textContent = demoStats.avgResolutionDays;
    }
}

// Animate numbers
function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 30);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-IN', options);
}

// Utility function to generate complaint ID
function generateComplaintId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CPL${year}${random}`;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
// Newsletter Form Handler (Homepage)
if (document.getElementById('newsletterForm')) {
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterSuccess = document.getElementById('newsletterSuccess');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail').value;
        
        // Simulate subscription (in production, send to backend)
        setTimeout(() => {
            newsletterForm.style.display = 'none';
            newsletterSuccess.style.display = 'flex';
            
            // Reset after 5 seconds
            setTimeout(() => {
                newsletterForm.style.display = 'block';
                newsletterSuccess.style.display = 'none';
                newsletterForm.reset();
            }, 5000);
        }, 500);
    });
}

// FAQ Toggle (Homepage)
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    // Initially hide answers
    if (answer) {
        answer.style.display = 'none';
    }
    
    if (question) {
        question.addEventListener('click', function() {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(a => {
                a.style.display = 'none';
            });
            document.querySelectorAll('.faq-icon').forEach(icon => {
                icon.style.transform = 'rotate(0deg)';
            });
            
            // Toggle current FAQ
            if (!isOpen) {
                answer.style.display = 'block';
                question.querySelector('.faq-icon').style.transform = 'rotate(90deg)';
            }
        });
    }
});