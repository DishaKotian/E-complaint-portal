// Public Dashboard functionality
let allComplaints = [];
let filteredComplaints = [];
let currentView = 'grid';
let currentSort = 'date-desc';

// Category icons mapping
const categoryIcons = {
    'Road Damage': 'fa-road',
    'Water Leak': 'fa-tint',
    'Streetlight': 'fa-lightbulb',
    'Garbage': 'fa-trash',
    'Electricity': 'fa-bolt',
    'Drainage': 'fa-water',
    'Safety': 'fa-shield-alt',
    'Other': 'fa-ellipsis-h'
};

// Helper function to get translation
function getTranslation(key) {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    return translations?.[lang]?.[key] || translations?.en?.[key] || key;
}

// Helper function to get translated category name
function getTranslatedCategory(category) {
    const categoryMap = {
        'Road Damage': 'category.roadDamage',
        'Water Leak': 'category.waterLeak',
        'Streetlight': 'category.streetlight',
        'Garbage': 'category.garbage',
        'Electricity': 'category.electricity',
        'Drainage': 'category.drainage',
        'Safety': 'category.safety',
        'Other': 'category.other'
    };
    return getTranslation(categoryMap[category]) || category;
}

// Helper function to get translated status
function getTranslatedStatus(status) {
    const statusMap = {
        'Pending': 'status.pending',
        'Assigned': 'status.assigned',
        'In Progress': 'status.inProgress',
        'Resolved': 'status.resolved'
    };
    return getTranslation(statusMap[status]) || status;
}

// Helper function to get translated priority
function getTranslatedPriority(priority) {
    const priorityMap = {
        'High': 'common.high',
        'Medium': 'common.medium',
        'Low': 'common.low'
    };
    return getTranslation(priorityMap[priority]) || priority;
}

// Load complaints on page load
document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();
    attachFilterListeners();
    attachViewToggleListeners();
    attachRefreshListener();
    attachExportListener();
    attachSortListener();
    attachBackToTopListener();
});

async function loadComplaints() {
    try {
        const response = await fetch('/api/complaints/public/all');
        const data = await response.json();
        
        allComplaints = data;
        filteredComplaints = data;
        
        updateStats();
        displayComplaints(filteredComplaints);
    } catch (error) {
        console.error('Error loading complaints:', error);
        showError();
    }
}

function updateStats() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    
    // Animate numbers
    animateValue('totalComplaints', 0, total, 1000);
    animateValue('pendingComplaints', 0, pending, 1000);
    animateValue('inProgressComplaints', 0, inProgress, 1000);
    animateValue('resolvedComplaints', 0, resolved, 1000);
}

// Animate counting numbers
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

function displayComplaints(complaints) {
    const container = document.getElementById('complaintsContainer');
    
    if (complaints.length === 0) {
        const noComplaintsText = getTranslation('dashboard.noComplaints') || 'No complaints found';
        const adjustFiltersText = getTranslation('dashboard.adjustFilters') || 'Try adjusting your filters or check back later';
        
        container.innerHTML = `
            <div class="no-complaints">
                <i class="fas fa-inbox"></i>
                <h3>${noComplaintsText}</h3>
                <p>${adjustFiltersText}</p>
            </div>
        `;
        return;
    }
    
    // Sort complaints based on current sort option
    const sortedComplaints = sortComplaints([...complaints]);
    
    // Apply view mode (grid or list)
    const viewClass = currentView === 'grid' ? 'complaints-grid' : 'complaints-list';
    const complaintsHTML = sortedComplaints.map((complaint, index) => {
        const card = createComplaintCard(complaint);
        return card.replace('<div class="complaint-card"', `<div class="complaint-card" style="animation-delay: ${index * 0.05}s"`);
    }).join('');
    
    const showingText = getTranslation('dashboard.showing') || 'Showing';
    const ofText = getTranslation('dashboard.of') || 'of';
    const complaintsText = getTranslation('dashboard.complaints') || 'complaints';
    
    const resultsCount = `
        <div class="results-count">
            ${showingText} <strong>${sortedComplaints.length}</strong> ${ofText} <strong>${allComplaints.length}</strong> ${complaintsText}
        </div>
    `;
    
    container.innerHTML = resultsCount + `<div class="${viewClass}">${complaintsHTML}</div>`;
}


function createComplaintCard(complaint) {
    const icon = categoryIcons[complaint.category] || 'fa-file-alt';
    const statusClass = complaint.status.toLowerCase().replace(' ', '-');
    const priorityClass = complaint.priority.toLowerCase();
    const date = new Date(complaint.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    const imageHTML = complaint.image ? 
        `<div class="complaint-image"><img src="${complaint.image}" alt="Complaint image"></div>` :
        `<div class="complaint-image"><i class="fas ${icon}"></i></div>`;
    
    // Get translated text
    const translatedCategory = getTranslatedCategory(complaint.category);
    const translatedStatus = getTranslatedStatus(complaint.status);
    const translatedPriority = getTranslatedPriority(complaint.priority);
    const priorityLabel = getTranslation('dashboard.priority') || 'Priority';
    
    return `
        <div class="complaint-card" onclick="showComplaintDetails(${complaint.id})">
            ${imageHTML}
            <div class="complaint-content">
                <div class="complaint-header">
                    <div class="complaint-id">#${complaint.id}</div>
                    <div class="complaint-status status-${statusClass}">${translatedStatus}</div>
                </div>
                
                <div class="complaint-category">
                    <i class="fas ${icon}"></i>
                    ${translatedCategory}
                </div>
                
                <div class="complaint-description">${complaint.description}</div>
                
                <div class="complaint-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${complaint.location}
                </div>
                
                <div class="complaint-footer">
                    <div class="complaint-date">
                        <i class="fas fa-calendar"></i> ${date}
                    </div>
                    <div class="priority-badge priority-${priorityClass}">
                        ${translatedPriority} ${priorityLabel}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function attachFilterListeners() {
    const categoryFilter = document.getElementById('filterCategory');
    const statusFilter = document.getElementById('filterStatus');
    const priorityFilter = document.getElementById('filterPriority');
    const locationFilter = document.getElementById('filterLocation');
    
    categoryFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    priorityFilter.addEventListener('change', applyFilters);
    locationFilter.addEventListener('input', applyFilters);
}

function applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const location = document.getElementById('filterLocation').value.toLowerCase();
    
    filteredComplaints = allComplaints.filter(complaint => {
        const matchCategory = !category || complaint.category === category;
        const matchStatus = !status || complaint.status === status;
        const matchPriority = !priority || complaint.priority === priority;
        const matchLocation = !location || complaint.location.toLowerCase().includes(location);
        
        return matchCategory && matchStatus && matchPriority && matchLocation;
    });
    
    displayComplaints(filteredComplaints);
}

function showError() {
    const container = document.getElementById('complaintsContainer');
    const errorText = getTranslation('dashboard.error') || 'Error Loading Complaints';
    const retryText = getTranslation('dashboard.retry') || 'Retry';
    
    container.innerHTML = `
        <div class="no-complaints">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${errorText}</h3>
            <p>Please check your connection and try again</p>
            <button onclick="loadComplaints()" class="btn btn-primary" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> ${retryText}
            </button>
        </div>
    `;
}

// Sort complaints
function sortComplaints(complaints) {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    switch (currentSort) {
        case 'date-desc':
            return complaints.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return complaints.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'priority-high':
            return complaints.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        case 'priority-low':
            return complaints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        default:
            return complaints;
    }
}

// View toggle listeners
function attachViewToggleListeners() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            displayComplaints(filteredComplaints);
        });
    });
}

// Refresh listener
function attachRefreshListener() {
    const refreshBtn = document.getElementById('refreshBtn');
    
    refreshBtn.addEventListener('click', () => {
        refreshBtn.querySelector('i').style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshBtn.querySelector('i').style.transform = 'rotate(0deg)';
        }, 600);
        loadComplaints();
    });
}

// Export listener
function attachExportListener() {
    const exportBtn = document.getElementById('exportBtn');
    
    exportBtn.addEventListener('click', () => {
        exportToCSV(filteredComplaints);
    });
}

// Export to CSV
function exportToCSV(complaints) {
    if (complaints.length === 0) {
        alert('No complaints to export!');
        return;
    }
    
    const headers = ['ID', 'Category', 'Description', 'Location', 'Status', 'Priority', 'Date'];
    const csvContent = [
        headers.join(','),
        ...complaints.map(c => [
            c.id,
            `"${c.category}"`,
            `"${c.description.replace(/"/g, '""')}"`,
            `"${c.location.replace(/"/g, '""')}"`,
            c.status,
            c.priority,
            new Date(c.date).toLocaleDateString()
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Sort listener
function attachSortListener() {
    const sortSelect = document.getElementById('sortBy');
    
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayComplaints(filteredComplaints);
    });
}

// Back to top listener
function attachBackToTopListener() {
    const backToTopBtn = document.getElementById('backToTop');
    
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Show complaint details in modal
function showComplaintDetails(complaintId) {
    const complaint = allComplaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    const modal = document.getElementById('complaintModal');
    const modalBody = document.getElementById('modalBody');
    
    const icon = categoryIcons[complaint.category] || 'fa-file-alt';
    const statusClass = complaint.status.toLowerCase().replace(' ', '-');
    const priorityClass = complaint.priority.toLowerCase();
    const date = new Date(complaint.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const imageHTML = complaint.image ? 
        `<img src="${complaint.image}" alt="Complaint image" class="modal-complaint-image">` :
        `<div class="modal-complaint-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white;">
            <i class="fas ${icon}" style="font-size: 5rem; opacity: 0.8;"></i>
        </div>`;
    
    // Get translated text
    const translatedCategory = getTranslatedCategory(complaint.category);
    const translatedStatus = getTranslatedStatus(complaint.status);
    const translatedPriority = getTranslatedPriority(complaint.priority);
    const descriptionLabel = getTranslation('dashboard.description') || 'Description';
    const locationLabel = getTranslation('dashboard.location') || 'Location';
    const priorityLabel = getTranslation('dashboard.priority') || 'Priority';
    const dateLabel = getTranslation('dashboard.date') || 'Submitted Date';
    
    modalBody.innerHTML = `
        ${imageHTML}
        <div class="modal-complaint-content">
            <div class="modal-header">
                <div class="modal-complaint-id">#${complaint.id}</div>
                <div class="complaint-status status-${statusClass}">${translatedStatus}</div>
            </div>
            
            <div class="complaint-category">
                <i class="fas ${icon}"></i>
                ${translatedCategory}
            </div>
            
            <div class="modal-description">
                <h4><i class="fas fa-info-circle"></i> ${descriptionLabel}</h4>
                <p>${complaint.description}</p>
            </div>
            
            <div class="modal-details-grid">
                <div class="modal-detail-item">
                    <div class="modal-detail-label">${locationLabel}</div>
                    <div class="modal-detail-value">
                        <i class="fas fa-map-marker-alt"></i> ${complaint.location}
                    </div>
                </div>
                
                <div class="modal-detail-item">
                    <div class="modal-detail-label">${priorityLabel}</div>
                    <div class="modal-detail-value">
                        <span class="priority-badge priority-${priorityClass}">${translatedPriority}</span>
                    </div>
                </div>
                
                <div class="modal-detail-item">
                    <div class="modal-detail-label">${dateLabel}</div>
                    <div class="modal-detail-value">
                        <i class="fas fa-calendar"></i> ${date}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Close modal on click outside or close button
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.onclick = () => modal.classList.remove('active');
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    };
}
