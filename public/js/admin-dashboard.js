// Admin Dashboard Functionality

let allComplaints = [];
let currentPage = 1;
const complaintsPerPage = 10;
let isBulkMode = false;
let selectedComplaints = new Set();
let sortColumn = 'date';
let sortDirection = 'desc';

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const admin = JSON.parse(localStorage.getItem('admin') || 'null');
    if (!admin) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
    
    // Initialize filters
    setupFilters();
    
    // Initialize sections visibility - Show dashboard by default, hide others
    const sections = ['filters', 'complaints-table', 'analytics', 'departments', 'users', 'settings'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
    }
});

async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:3000/api/complaints');
        const complaints = await response.json();
        allComplaints = complaints;
    } catch (error) {
        console.log('Server not running, using local data');
        // Load from localStorage
        allComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        
        // Add some demo data if empty
        if (allComplaints.length === 0) {
            allComplaints = generateDemoComplaints();
            localStorage.setItem('complaints', JSON.stringify(allComplaints));
        }
    }
    
    updateDashboardStats();
    displayComplaints(allComplaints);
    updateAnalyticsCharts();
    updateDepartmentsSection();
}

function generateDemoComplaints() {
    const categories = ['Road Damage', 'Water Leak', 'Streetlight', 'Garbage', 'Electricity'];
    const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    const priorities = ['Low', 'Medium', 'High'];
    const departments = ['Public Works', 'Water Supply', 'Electricity', 'Sanitation'];
    const locations = ['MG Road', 'Station Road', 'Market Area', 'Park Street', 'Main Square'];
    
    const complaints = [];
    for (let i = 1; i <= 25; i++) {
        complaints.push({
            id: `CPL2026${String(i).padStart(4, '0')}`,
            fullName: `Citizen ${i}`,
            phone: `98765432${String(i).padStart(2, '0')}`,
            email: `citizen${i}@example.com`,
            category: categories[Math.floor(Math.random() * categories.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            description: `Sample complaint description for issue ${i}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            department: Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    return complaints;
}

function updateDashboardStats() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    
    document.getElementById('dashTotalComplaints').textContent = total;
    document.getElementById('dashPendingComplaints').textContent = pending;
    document.getElementById('dashInProgressComplaints').textContent = inProgress;
    document.getElementById('dashResolvedComplaints').textContent = resolved;
}

function displayComplaints(complaints) {
    const tbody = document.getElementById('complaintsTableBody');
    if (!tbody) return;
    
    const start = (currentPage - 1) * complaintsPerPage;
    const end = start + complaintsPerPage;
    const paginatedComplaints = complaints.slice(start, end);
    
    tbody.innerHTML = paginatedComplaints.map(complaint => `
        <tr>
            <td><strong>${complaint.id}</strong></td>
            <td>${new Date(complaint.date).toLocaleDateString()}</td>
            <td>${complaint.fullName}</td>
            <td>${complaint.category}</td>
            <td>${complaint.location}</td>
            <td><span class="status-badge ${complaint.priority.toLowerCase()}">${complaint.priority}</span></td>
            <td><span class="status-badge ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
            <td>${complaint.department || 'Not Assigned'}</td>
            <td>
                <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-right: 0.5rem;" onclick="viewComplaint('${complaint.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="updateComplaint('${complaint.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Update pagination
    const totalPages = Math.ceil(complaints.length / complaintsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
}

function applyFilters() {
    const category = document.getElementById('filterCategory').value;
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const department = document.getElementById('filterDepartment').value;
    
    let filtered = allComplaints;
    
    if (category) {
        filtered = filtered.filter(c => c.category === category);
    }
    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }
    if (priority) {
        filtered = filtered.filter(c => c.priority === priority);
    }
    if (department) {
        filtered = filtered.filter(c => c.department === department);
    }
    
    currentPage = 1;
    displayComplaints(filtered);
}

function clearFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterDepartment').value = '';
    currentPage = 1;
    displayComplaints(allComplaints);
}

function filterComplaints() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const filtered = allComplaints.filter(c => 
        c.id.toLowerCase().includes(searchTerm) ||
        c.fullName.toLowerCase().includes(searchTerm) ||
        c.location.toLowerCase().includes(searchTerm) ||
        c.category.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    displayComplaints(filtered);
}

function viewComplaint(id) {
    const complaint = allComplaints.find(c => c.id === id);
    if (!complaint) return;
    
    const modal = document.getElementById('complaintModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <span class="detail-label">Complaint ID</span>
                <span class="detail-value">${complaint.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDate(complaint.date)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Name</span>
                <span class="detail-value">${complaint.fullName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${complaint.phone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value">${complaint.email}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">${complaint.category}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Priority</span>
                <span class="detail-value">${complaint.priority}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">${complaint.status}</span>
            </div>
            <div class="detail-item full-width">
                <span class="detail-label">Location</span>
                <span class="detail-value">${complaint.location}</span>
            </div>
            <div class="detail-item full-width">
                <span class="detail-label">Description</span>
                <span class="detail-value">${complaint.description}</span>
            </div>
            ${complaint.department ? `
            <div class="detail-item">
                <span class="detail-label">Department</span>
                <span class="detail-value">${complaint.department}</span>
            </div>
            ` : ''}
        </div>
        ${complaint.image ? `
            <div style="margin-top: 1rem;">
                <strong>Attached Image:</strong><br>
                <img src="${complaint.image}" style="max-width: 100%; margin-top: 0.5rem; border-radius: 8px;">
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('complaintModal').classList.remove('active');
}

function updateComplaint(id) {
    const complaint = allComplaints.find(c => c.id === id);
    if (!complaint) return;
    
    document.getElementById('updateComplaintId').value = id;
    document.getElementById('updateStatus').value = complaint.status;
    document.getElementById('updateDepartment').value = complaint.department || '';
    document.getElementById('updatePriority').value = complaint.priority;
    
    const modal = document.getElementById('updateModal');
    modal.classList.add('active');
}

function closeUpdateModal() {
    document.getElementById('updateModal').classList.remove('active');
}

// Update form submission
document.getElementById('updateForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('updateComplaintId').value;
    const status = document.getElementById('updateStatus').value;
    const department = document.getElementById('updateDepartment').value;
    const priority = document.getElementById('updatePriority').value;
    const notes = document.getElementById('updateNotes').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/complaints/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, department, priority, notes })
        });
        
        if (response.ok) {
            showNotification('Complaint updated successfully!', 'success');
            closeUpdateModal();
            loadDashboardData();
        }
    } catch (error) {
        console.log('Server not running, updating locally');
        // Update in localStorage
        const complaint = allComplaints.find(c => c.id === id);
        if (complaint) {
            complaint.status = status;
            complaint.department = department;
            complaint.priority = priority;
            if (notes) {
                complaint.updates = complaint.updates || [];
                complaint.updates.push({
                    date: new Date().toISOString(),
                    message: notes
                });
            }
            localStorage.setItem('complaints', JSON.stringify(allComplaints));
            showNotification('Complaint updated successfully!', 'success');
            closeUpdateModal();
            loadDashboardData();
        }
    }
});

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayComplaints(allComplaints);
    }
}

function nextPage() {
    const totalPages = Math.ceil(allComplaints.length / complaintsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayComplaints(allComplaints);
    }
}

function exportToCSV() {
    const csv = ['ID,Date,Name,Email,Phone,Category,Location,Priority,Status,Department'];
    allComplaints.forEach(c => {
        csv.push(`${c.id},${new Date(c.date).toLocaleDateString()},${c.fullName},${c.email},${c.phone},${c.category},${c.location},${c.priority},${c.status},${c.department || 'N/A'}`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaints.csv';
    a.click();
}

function logout() {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

// ==================== ENHANCED FEATURES ====================

// Instant Search
function instantSearch() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const filtered = allComplaints.filter(c => 
        c.id.toLowerCase().includes(searchTerm) ||
        c.fullName.toLowerCase().includes(searchTerm) ||
        c.location.toLowerCase().includes(searchTerm) ||
        c.category.toLowerCase().includes(searchTerm) ||
        (c.department && c.department.toLowerCase().includes(searchTerm))
    );
    currentPage = 1;
    displayComplaints(filtered);
}

// Setup Filters
function setupFilters() {
    const filters = ['filterCategory', 'filterStatus', 'filterPriority', 'filterDepartment'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
}

// Refresh Dashboard
function refreshDashboard() {
    const refreshBtn = document.querySelector('.refresh-btn i');
    refreshBtn.classList.add('fa-spin');
    
    loadDashboardData().then(() => {
        refreshBtn.classList.remove('fa-spin');
        showNotification('Dashboard refreshed successfully', 'success');
    });
}

// Toggle Bulk Mode
function toggleBulkMode() {
    isBulkMode = !isBulkMode;
    const bulkCols = document.querySelectorAll('.bulk-select-col');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const bulkModeText = document.getElementById('bulkModeText');
    
    bulkCols.forEach(col => {
        col.style.display = isBulkMode ? 'table-cell' : 'none';
    });
    
    bulkActionsBar.style.display = isBulkMode ? 'flex' : 'none';
    bulkModeText.textContent = isBulkMode ? 'Exit Bulk Mode' : 'Bulk Select';
    
    if (!isBulkMode) {
        selectedComplaints.clear();
        updateSelectedCount();
    }
}

// Toggle Select All
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.complaint-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
        const id = checkbox.dataset.id;
        if (selectAll.checked) {
            selectedComplaints.add(id);
        } else {
            selectedComplaints.delete(id);
        }
    });
    
    updateSelectedCount();
}

// Toggle Individual Selection
function toggleSelect(checkbox, id) {
    if (checkbox.checked) {
        selectedComplaints.add(id);
    } else {
        selectedComplaints.delete(id);
    }
    updateSelectedCount();
}

// Update Selected Count
function updateSelectedCount() {
    const count = document.getElementById('selectedCount');
    if (count) {
        count.textContent = selectedComplaints.size;
    }
}

// Deselect All
function deselectAll() {
    selectedComplaints.clear();
    document.getElementById('selectAll').checked = false;
    document.querySelectorAll('.complaint-checkbox').forEach(cb => cb.checked = false);
    updateSelectedCount();
}

// Bulk Update Status
function bulkUpdateStatus() {
    if (selectedComplaints.size === 0) {
        showNotification('Please select complaints first', 'warning');
        return;
    }
    
    const status = prompt('Enter new status (Pending/Assigned/In Progress/Resolved):');
    if (status) {
        selectedComplaints.forEach(id => {
            const complaint = allComplaints.find(c => c.id === id);
            if (complaint) {
                complaint.status = status;
            }
        });
        
        saveComplaintsToServer();
        showNotification(`${selectedComplaints.size} complaints updated to ${status}`, 'success');
        deselectAll();
        loadDashboardData();
    }
}

// Bulk Assign Department
function bulkAssignDepartment() {
    if (selectedComplaints.size === 0) {
        showNotification('Please select complaints first', 'warning');
        return;
    }
    
    const department = prompt('Enter department name (Public Works/Water Supply/Electricity/Sanitation/Police):');
    if (department) {
        selectedComplaints.forEach(id => {
            const complaint = allComplaints.find(c => c.id === id);
            if (complaint) {
                complaint.department = department;
                complaint.status = 'Assigned';
            }
        });
        
        saveComplaintsToServer();
        showNotification(`${selectedComplaints.size} complaints assigned to ${department}`, 'success');
        deselectAll();
        loadDashboardData();
    }
}

// Bulk Delete
function bulkDelete() {
    if (selectedComplaints.size === 0) {
        showNotification('Please select complaints first', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedComplaints.size} complaints? This action cannot be undone.`)) {
        allComplaints = allComplaints.filter(c => !selectedComplaints.has(c.id));
        saveComplaintsToServer();
        showNotification(`${selectedComplaints.size} complaints deleted`, 'success');
        deselectAll();
        loadDashboardData();
    }
}

// Sort Table
function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    allComplaints.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (column === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    displayComplaints(allComplaints);
}

// Show Bulk Assign Modal
function showBulkAssign() {
    showNotification('Toggle bulk mode first, then select complaints', 'info');
    if (!isBulkMode) {
        toggleBulkMode();
    }
}

// Export Report
function exportReport() {
    const reportType = prompt('Export as:\n1. PDF Report\n2. Excel\n3. CSV\n\nEnter 1, 2, or 3:');
    
    switch(reportType) {
        case '1':
            showNotification('PDF report generation coming soon!', 'info');
            break;
        case '2':
            showNotification('Excel export coming soon!', 'info');
            break;
        case '3':
            exportToCSV();
            break;
        default:
            showNotification('Invalid selection', 'warning');
    }
}

// Show Analytics
function showAnalytics() {
    showNotification('Advanced analytics dashboard coming soon!', 'info');
    // Future: Open analytics modal with charts
}

// Show Notifications
function showNotifications() {
    const notifications = [
        { icon: 'fa-exclamation-circle', text: '5 new pending complaints', time: '2 min ago', type: 'warning' },
        { icon: 'fa-check-circle', text: '3 complaints resolved today', time: '1 hour ago', type: 'success' },
        { icon: 'fa-user', text: '2 new user registrations', time: '3 hours ago', type: 'info' },
        { icon: 'fa-clock', text: 'Weekly report ready', time: '1 day ago', type: 'info' },
        { icon: 'fa-bell', text: 'System maintenance scheduled', time: '2 days ago', type: 'warning' }
    ];
    
    let notifHTML = '<div class="notifications-panel"><h3>Notifications</h3><div class="notif-list">';
    notifications.forEach(notif => {
        notifHTML += `
            <div class="notif-item ${notif.type}">
                <i class="fas ${notif.icon}"></i>
                <div class="notif-content">
                    <p>${notif.text}</p>
                    <small>${notif.time}</small>
                </div>
            </div>
        `;
    });
    notifHTML += '</div></div>';
    
    showModal('Notifications', notifHTML);
}

// Show Add Complaint Modal
function showAddComplaint() {
    showNotification('Add complaint form will open here', 'info');
    // Future: Open modal with complaint form
}

// Save Complaints to Server
async function saveComplaintsToServer() {
    try {
        // In production, this would POST to server
        localStorage.setItem('complaints', JSON.stringify(allComplaints));
    } catch (error) {
        console.error('Error saving complaints:', error);
    }
}

// Show Modal
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-box">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.custom-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideInRight 0.3s ease;
        min-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== SIDEBAR NAVIGATION ====================

// Navigate to Section
function navigateToSection(sectionId, event, filter = null) {
    event.preventDefault();
    
    // Hide all sections
    const sections = ['dashboard', 'filters', 'complaints-table', 'analytics', 'departments', 'users', 'settings'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.closest('li').classList.add('active');
    
    // Show target section(s)
    if (sectionId === 'dashboard') {
        document.getElementById('dashboard').style.display = 'block';
    } else if (sectionId === 'all-complaints') {
        document.getElementById('filters').style.display = 'block';
        document.getElementById('complaints-table').style.display = 'block';
        // Clear all filters
        clearFilters();
    } else if (sectionId === 'complaints-table') {
        document.getElementById('filters').style.display = 'block';
        document.getElementById('complaints-table').style.display = 'block';
        
        // Apply filter if specified
        if (filter) {
            document.getElementById('filterStatus').value = filter;
            applyFilters();
        }
    } else if (sectionId === 'analytics') {
        document.getElementById('analytics').style.display = 'block';
    } else if (sectionId === 'departments') {
        document.getElementById('departments').style.display = 'block';
    } else if (sectionId === 'users') {
        document.getElementById('users').style.display = 'block';
    } else if (sectionId === 'settings') {
        document.getElementById('settings').style.display = 'block';
    }
    
    // Scroll to top of main content
    document.querySelector('.dashboard-main').scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update charts if navigating to analytics
    if (sectionId === 'analytics') {
        updateAnalyticsCharts();
    }
    
    // Update departments if navigating to departments
    if (sectionId === 'departments') {
        updateDepartmentsSection();
    }
}

// ==================== ANALYTICS CHARTS ====================

let categoryChart, trendChart, resolutionChart, departmentChart;

function updateAnalyticsCharts() {
    createCategoryChart();
    createTrendChart();
    createResolutionChart();
    createDepartmentChart();
}

// Category Chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Count complaints by category
    const categoryCounts = {};
    allComplaints.forEach(c => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });
    
    // Destroy existing chart
    if (categoryChart) categoryChart.destroy();
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                data: Object.values(categoryCounts),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#00f2fe',
                    '#43e97b',
                    '#fa709a',
                    '#fee140'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Complaints Distribution by Category',
                    font: { size: 14, weight: 'bold' }
                }
            }
        }
    });
}

// Monthly Trend Chart
function createTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Get last 6 months data
    const months = [];
    const counts = [];
    const resolvedCounts = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        
        // Count complaints for this month
        const monthComplaints = allComplaints.filter(c => {
            const cDate = new Date(c.date);
            return cDate.getMonth() === date.getMonth() && cDate.getFullYear() === date.getFullYear();
        });
        
        counts.push(monthComplaints.length);
        resolvedCounts.push(monthComplaints.filter(c => c.status === 'Resolved').length);
    }
    
    // Destroy existing chart
    if (trendChart) trendChart.destroy();
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Total Complaints',
                data: counts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }, {
                label: 'Resolved',
                data: resolvedCounts,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '6-Month Complaint Trends',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Resolution Rate Chart
function createResolutionChart() {
    const ctx = document.getElementById('resolutionChart');
    if (!ctx) return;
    
    // Count by status
    const pending = allComplaints.filter(c => c.status === 'Pending').length;
    const assigned = allComplaints.filter(c => c.status === 'Assigned').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    
    // Destroy existing chart
    if (resolutionChart) resolutionChart.destroy();
    
    resolutionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
            datasets: [{
                label: 'Number of Complaints',
                data: [pending, assigned, inProgress, resolved],
                backgroundColor: [
                    '#f59e0b',
                    '#3b82f6',
                    '#8b5cf6',
                    '#10b981'
                ],
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Status-wise Breakdown',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Department Performance Chart
function createDepartmentChart() {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;
    
    // Count by department
    const deptCounts = {};
    const deptResolved = {};
    
    allComplaints.forEach(c => {
        if (c.department) {
            deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
            if (c.status === 'Resolved') {
                deptResolved[c.department] = (deptResolved[c.department] || 0) + 1;
            }
        }
    });
    
    const departments = Object.keys(deptCounts);
    const totalCounts = departments.map(d => deptCounts[d]);
    const resolvedCounts = departments.map(d => deptResolved[d] || 0);
    
    // Destroy existing chart
    if (departmentChart) departmentChart.destroy();
    
    departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: departments,
            datasets: [{
                label: 'Total Assigned',
                data: totalCounts,
                backgroundColor: '#667eea',
                borderRadius: 6
            }, {
                label: 'Resolved',
                data: resolvedCounts,
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Department Performance',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// ==================== DEPARTMENTS SECTION ====================

function updateDepartmentsSection() {
    const departments = [
        { name: 'Public Works', icon: 'fa-road', color: '#667eea' },
        { name: 'Water Supply', icon: 'fa-tint', color: '#3b82f6' },
        { name: 'Electricity', icon: 'fa-bolt', color: '#f59e0b' },
        { name: 'Sanitation', icon: 'fa-dumpster', color: '#10b981' },
        { name: 'Police', icon: 'fa-shield-alt', color: '#ef4444' }
    ];
    
    const deptsGrid = document.querySelector('.departments-grid');
    if (!deptsGrid) return;
    
    deptsGrid.innerHTML = departments.map(dept => {
        // Count complaints for this department
        const deptComplaints = allComplaints.filter(c => 
            c.department && c.department.includes(dept.name)
        );
        const activeCount = deptComplaints.filter(c => c.status !== 'Resolved').length;
        const resolvedCount = deptComplaints.filter(c => c.status === 'Resolved').length;
        const pendingCount = deptComplaints.filter(c => c.status === 'Pending').length;
        const resolutionRate = deptComplaints.length > 0 
            ? Math.round((resolvedCount / deptComplaints.length) * 100) 
            : 0;
        
        return `
            <div class="dept-card" style="border-top: 4px solid ${dept.color}">
                <i class="fas ${dept.icon}" style="color: ${dept.color}"></i>
                <h3>${dept.name}</h3>
                <div class="dept-stats">
                    <div class="dept-stat">
                        <span class="stat-number">${deptComplaints.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="dept-stat">
                        <span class="stat-number" style="color: #f59e0b">${activeCount}</span>
                        <span class="stat-label">Active</span>
                    </div>
                    <div class="dept-stat">
                        <span class="stat-number" style="color: #10b981">${resolvedCount}</span>
                        <span class="stat-label">Resolved</span>
                    </div>
                </div>
                <div class="dept-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${resolutionRate}%; background: ${dept.color}"></div>
                    </div>
                    <span class="progress-text">${resolutionRate}% Resolution Rate</span>
                </div>
                <button class="btn btn-primary" onclick="viewDepartmentDetails('${dept.name}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
    }).join('');
}

// View Department Details
function viewDepartmentDetails(deptName) {
    const deptComplaints = allComplaints.filter(c => 
        c.department && c.department.includes(deptName)
    );
    
    const pending = deptComplaints.filter(c => c.status === 'Pending').length;
    const assigned = deptComplaints.filter(c => c.status === 'Assigned').length;
    const inProgress = deptComplaints.filter(c => c.status === 'In Progress').length;
    const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
    
    const avgResolutionTime = calculateAvgResolutionTime(deptComplaints.filter(c => c.status === 'Resolved'));
    
    const modalContent = `
        <div class="dept-details">
            <h3 style="margin-bottom: 1.5rem; color: #1f2937;">
                <i class="fas fa-building"></i> ${deptName} Department
            </h3>
            
            <div class="dept-detail-stats">
                <div class="detail-stat-card pending">
                    <i class="fas fa-clock"></i>
                    <div>
                        <h4>${pending}</h4>
                        <p>Pending</p>
                    </div>
                </div>
                <div class="detail-stat-card assigned">
                    <i class="fas fa-user-check"></i>
                    <div>
                        <h4>${assigned}</h4>
                        <p>Assigned</p>
                    </div>
                </div>
                <div class="detail-stat-card progress">
                    <i class="fas fa-spinner"></i>
                    <div>
                        <h4>${inProgress}</h4>
                        <p>In Progress</p>
                    </div>
                </div>
                <div class="detail-stat-card resolved">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h4>${resolved}</h4>
                        <p>Resolved</p>
                    </div>
                </div>
            </div>
            
            <div class="dept-metrics">
                <div class="metric-item">
                    <i class="fas fa-chart-line"></i>
                    <span>Total Complaints: <strong>${deptComplaints.length}</strong></span>
                </div>
                <div class="metric-item">
                    <i class="fas fa-clock"></i>
                    <span>Avg Resolution Time: <strong>${avgResolutionTime}</strong></span>
                </div>
                <div class="metric-item">
                    <i class="fas fa-percentage"></i>
                    <span>Success Rate: <strong>${deptComplaints.length > 0 ? Math.round((resolved / deptComplaints.length) * 100) : 0}%</strong></span>
                </div>
            </div>
            
            <div class="recent-complaints">
                <h4 style="margin: 1.5rem 0 1rem; color: #374151;">Recent Complaints</h4>
                <div class="complaints-list">
                    ${deptComplaints.slice(0, 5).map(c => `
                        <div class="complaint-item">
                            <div class="complaint-header">
                                <span class="complaint-id">${c.id}</span>
                                <span class="badge badge-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span>
                            </div>
                            <p class="complaint-category"><i class="fas fa-tag"></i> ${c.category}</p>
                            <p class="complaint-location"><i class="fas fa-map-marker-alt"></i> ${c.location}</p>
                            <p class="complaint-date"><i class="fas fa-calendar"></i> ${new Date(c.date).toLocaleDateString()}</p>
                        </div>
                    `).join('') || '<p>No complaints assigned yet.</p>'}
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="filterByDepartment('${deptName}')" style="margin-top: 1rem; width: 100%;">
                <i class="fas fa-filter"></i> View All ${deptName} Complaints
            </button>
        </div>
    `;
    
    showModal(`${deptName} Department Details`, modalContent);
}

// Calculate Average Resolution Time
function calculateAvgResolutionTime(resolvedComplaints) {
    if (resolvedComplaints.length === 0) return 'N/A';
    
    // Assume complaints are resolved within 1-10 days randomly
    const avgDays = Math.floor(Math.random() * 7) + 3;
    return `${avgDays} days`;
}

// Filter by Department
function filterByDepartment(deptName) {
    // Close modal
    document.querySelectorAll('.custom-modal').forEach(m => m.remove());
    
    // Navigate to complaints table
    navigateToSection('complaints-table', { preventDefault: () => {}, target: { closest: () => ({ classList: { add: () => {}, remove: () => {} } }) } });
    
    // Apply filter
    document.getElementById('filterDepartment').value = deptName;
    applyFilters();
    
    showNotification(`Filtered to show ${deptName} complaints`, 'info');
}
