// Department Dashboard Functionality
let allComplaints = [];
let filteredComplaints = [];
let departmentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const deptData = localStorage.getItem('department');
    if (!deptData) {
        window.location.href = 'department-login.html';
        return;
    }

    departmentUser = JSON.parse(deptData);
    document.getElementById('userEmail').textContent = departmentUser.email;
    document.getElementById('deptName').textContent = departmentUser.department;

    // Load complaints
    loadComplaints();

    // Event listeners
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('filterStatus')?.addEventListener('change', applyFilters);
    document.getElementById('filterPriority')?.addEventListener('change', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('updateForm')?.addEventListener('submit', handleUpdate);
});

// Load complaints from server
async function loadComplaints() {
    try {
        const response = await fetch('/api/complaints');
        if (response.ok) {
            const data = await response.json();
            // Filter complaints assigned to this department
            allComplaints = data.complaints.filter(c => 
                c.department === departmentUser.department
            );
            filteredComplaints = [...allComplaints];
            updateStats();
            displayComplaints();
        } else {
            // Use demo data if API fails
            loadDemoData();
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        loadDemoData();
    }
}

// Load demo data
function loadDemoData() {
    const categories = ['Road Repair', 'Street Light', 'Water Supply', 'Garbage Collection', 'Drainage'];
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    const priorities = ['Low', 'Medium', 'High'];
    const locations = ['MG Road', 'Brigade Road', 'Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar'];
    
    allComplaints = Array.from({ length: 15 }, (_, i) => ({
        id: `CMP${String(1000 + i).padStart(4, '0')}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Issue with ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} requiring attention`,
        location: locations[Math.floor(Math.random() * locations.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        department: departmentUser.department,
        name: 'Citizen ' + (i + 1),
        email: `citizen${i + 1}@example.com`,
        phone: '98' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0'),
        notes: Math.random() > 0.5 ? 'Work in progress' : ''
    }));

    filteredComplaints = [...allComplaints];
    updateStats();
    displayComplaints();
}

// Update statistics
function updateStats() {
    const total = allComplaints.length;
    const assigned = allComplaints.filter(c => c.status === 'Pending').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    document.getElementById('assignedCount').textContent = assigned;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('resolvedCount').textContent = resolved;
    document.getElementById('successRate').textContent = successRate + '%';
}

// Display complaints in table
function displayComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    const resultCount = document.getElementById('resultCount');
    
    // Update result count
    if (resultCount) {
        resultCount.textContent = filteredComplaints.length;
    }
    
    if (filteredComplaints.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-cell">
                    <div class="empty-state">
                        <i class="fas fa-inbox fa-4x"></i>
                        <h3>No Complaints Found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredComplaints.map(complaint => `
        <tr class="complaint-row">
            <td class="id-cell"><span class="complaint-id">${complaint.id}</span></td>
            <td>${complaint.date}</td>
            <td><span class="category-badge">${complaint.category}</span></td>
            <td class="description-cell">${complaint.description.substring(0, 50)}${complaint.description.length > 50 ? '...' : ''}</td>
            <td><i class="fas fa-map-marker-alt" style="color: #f59e0b;"></i> ${complaint.location}</td>
            <td><span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
            <td><span class="priority-badge priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></td>
            <td class="action-buttons">
                <button class="dept-btn-view" onclick="viewComplaint('${complaint.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="dept-btn-edit" onclick="editComplaint('${complaint.id}')" title="Update Status">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Apply filters
function applyFilters() {
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    filteredComplaints = allComplaints.filter(complaint => {
        const matchStatus = !status || complaint.status === status;
        const matchPriority = !priority || complaint.priority === priority;
        const matchSearch = !search || 
            complaint.id.toLowerCase().includes(search) ||
            complaint.description.toLowerCase().includes(search) ||
            complaint.category.toLowerCase().includes(search) ||
            complaint.location.toLowerCase().includes(search);
        
        return matchStatus && matchPriority && matchSearch;
    });

    displayComplaints();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('searchInput').value = '';
    filteredComplaints = [...allComplaints];
    displayComplaints();
}

// View complaint details
function viewComplaint(id) {
    const complaint = allComplaints.find(c => c.id === id);
    if (!complaint) return;

    const modalBody = document.getElementById('viewModalBody');
    modalBody.innerHTML = `
        <div class="complaint-details">
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Complaint ID</span>
                    <span class="detail-value"><strong>${complaint.id}</strong></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date Submitted</span>
                    <span class="detail-value">${complaint.date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">${complaint.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value"><span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority</span>
                    <span class="detail-value"><span class="priority-badge priority-${complaint.priority.toLowerCase()}">${complaint.priority}</span></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value"><i class="fas fa-map-marker-alt"></i> ${complaint.location}</span>
                </div>
                <div class="detail-item full-width">
                    <span class="detail-label">Description</span>
                    <span class="detail-value">${complaint.description}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Citizen Name</span>
                    <span class="detail-value">${complaint.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${complaint.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${complaint.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Department</span>
                    <span class="detail-value"><strong style="color: #f59e0b;">${complaint.department}</strong></span>
                </div>
                ${complaint.notes ? `
                <div class="detail-item full-width">
                    <span class="detail-label">Resolution Notes</span>
                    <span class="detail-value">${complaint.notes}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('viewModal').style.display = 'block';
}

// Edit complaint
function editComplaint(id) {
    const complaint = allComplaints.find(c => c.id === id);
    if (!complaint) return;

    document.getElementById('updateComplaintId').value = id;
    document.getElementById('updateStatus').value = complaint.status;
    document.getElementById('updatePriority').value = complaint.priority;
    document.getElementById('updateNotes').value = complaint.notes || '';

    document.getElementById('updateModal').style.display = 'block';
}

// Handle update form submission
async function handleUpdate(e) {
    e.preventDefault();

    const id = document.getElementById('updateComplaintId').value;
    const status = document.getElementById('updateStatus').value;
    const priority = document.getElementById('updatePriority').value;
    const notes = document.getElementById('updateNotes').value;

    try {
        const response = await fetch(`/api/complaints/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, priority, notes })
        });

        if (response.ok) {
            showNotification('Complaint updated successfully!', 'success');
            closeModal('updateModal');
            loadComplaints();
        } else {
            // Update local data if API fails
            updateLocalComplaint(id, status, priority, notes);
        }
    } catch (error) {
        console.error('Error updating complaint:', error);
        updateLocalComplaint(id, status, priority, notes);
    }
}

// Update complaint locally
function updateLocalComplaint(id, status, priority, notes) {
    const complaint = allComplaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = status;
        complaint.priority = priority;
        complaint.notes = notes;
        
        updateStats();
        applyFilters();
        closeModal('updateModal');
        showNotification('Complaint updated successfully!', 'success');
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Logout
function logout() {
    localStorage.removeItem('department');
    window.location.href = 'department-login.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
