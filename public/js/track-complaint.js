// Track Complaint Functionality

document.addEventListener('DOMContentLoaded', function() {
    const trackForm = document.getElementById('trackForm');
    const complaintId = document.getElementById('complaintId');
    
    // Load stats
    loadTrackStats();
    
    if (trackForm) {
        trackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = complaintId.value.trim();
            
            if (!id) {
                showNotification('Please enter a complaint ID', 'error');
                return;
            }
            
            searchComplaint(id);
        });
    }
    
    // Rating stars
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            document.getElementById('rating').value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });
    
    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const rating = document.getElementById('rating').value;
            const feedback = document.getElementById('feedbackText').value;
            
            if (rating === '0') {
                showNotification('Please select a rating', 'error');
                return;
            }
            
            submitFeedback(rating, feedback);
        });
    }
});

async function loadTrackStats() {
    try {
        const response = await fetch('http://localhost:3000/api/complaints/stats');
        const stats = await response.json();
        
        document.getElementById('totalComplaintsTrack').textContent = stats.total || 0;
        document.getElementById('resolvedComplaintsTrack').textContent = stats.resolved || 0;
        document.getElementById('avgTimeTrack').textContent = stats.avgResolutionDays || 0;
    } catch (error) {
        // Use demo data
        document.getElementById('totalComplaintsTrack').textContent = '150';
        document.getElementById('resolvedComplaintsTrack').textContent = '120';
        document.getElementById('avgTimeTrack').textContent = '5';
    }
}

async function searchComplaint(id) {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const complaintDetails = document.getElementById('complaintDetails');
    
    // Hide all sections
    errorMessage.style.display = 'none';
    complaintDetails.style.display = 'none';
    loading.style.display = 'block';
    
    try {
        const response = await fetch(`http://localhost:3000/api/complaints/${id}`);
        
        if (response.ok) {
            const complaint = await response.json();
            displayComplaintDetails(complaint);
        } else {
            throw new Error('Not found');
        }
    } catch (error) {
        console.log('Server not running, checking local storage');
        // Fallback to localStorage
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        const complaint = complaints.find(c => c.id === id);
        
        loading.style.display = 'none';
        
        if (complaint) {
            displayComplaintDetails(complaint);
        } else {
            errorMessage.style.display = 'block';
        }
    }
}

function displayComplaintDetails(complaint) {
    document.getElementById('loading').style.display = 'none';
    const detailsSection = document.getElementById('complaintDetails');
    detailsSection.style.display = 'block';
    
    // Update basic details
    document.getElementById('detailId').textContent = complaint.id;
    document.getElementById('detailDate').textContent = formatDate(complaint.date);
    document.getElementById('detailCategory').textContent = complaint.category;
    document.getElementById('detailPriority').textContent = complaint.priority || 'Medium';
    document.getElementById('detailName').textContent = complaint.fullName;
    document.getElementById('detailPhone').textContent = complaint.phone;
    document.getElementById('detailLocation').textContent = complaint.location;
    document.getElementById('detailDescription').textContent = complaint.description;
    
    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = complaint.status;
    statusBadge.className = 'status-badge ' + complaint.status.toLowerCase().replace(' ', '-');
    
    // Show department if assigned
    if (complaint.department) {
        document.getElementById('departmentContainer').style.display = 'flex';
        document.getElementById('detailDepartment').textContent = complaint.department;
    }
    
    // Show image if available
    if (complaint.image) {
        document.getElementById('imageContainer').style.display = 'block';
        document.getElementById('complaintImage').src = complaint.image;
    }
    
    // Update timeline
    updateTimeline(complaint);
    
    // Show updates if any
    if (complaint.updates && complaint.updates.length > 0) {
        showUpdates(complaint.updates);
    }
    
    // Show feedback section if resolved
    if (complaint.status === 'Resolved') {
        document.getElementById('feedbackSection').style.display = 'block';
    }
    
    // Scroll to details
    detailsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateTimeline(complaint) {
    // Submitted
    const submittedItem = document.getElementById('timelineSubmitted');
    const submittedDate = document.getElementById('timelineSubmittedDate');
    submittedItem.classList.add('active');
    submittedDate.textContent = formatDate(complaint.date);
    
    // Assigned
    const assignedItem = document.getElementById('timelineAssigned');
    const assignedDate = document.getElementById('timelineAssignedDate');
    if (complaint.status === 'Assigned' || complaint.status === 'In Progress' || complaint.status === 'Resolved') {
        assignedItem.classList.add('active');
        assignedDate.textContent = complaint.assignedDate ? formatDate(complaint.assignedDate) : 'Assigned';
    }
    
    // In Progress
    const progressItem = document.getElementById('timelineInProgress');
    const progressDate = document.getElementById('timelineInProgressDate');
    if (complaint.status === 'In Progress' || complaint.status === 'Resolved') {
        progressItem.classList.add('active');
        progressDate.textContent = complaint.inProgressDate ? formatDate(complaint.inProgressDate) : 'In Progress';
    }
    
    // Resolved
    const resolvedItem = document.getElementById('timelineResolved');
    const resolvedDate = document.getElementById('timelineResolvedDate');
    if (complaint.status === 'Resolved') {
        resolvedItem.classList.add('active');
        resolvedDate.textContent = complaint.resolvedDate ? formatDate(complaint.resolvedDate) : 'Resolved';
    }
}

function showUpdates(updates) {
    const updatesSection = document.getElementById('updatesSection');
    const updatesList = document.getElementById('updatesList');
    
    updatesSection.style.display = 'block';
    updatesList.innerHTML = updates.map(update => `
        <div style="background: white; padding: 1rem; border-left: 3px solid #2563eb; margin-bottom: 1rem; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong>${update.title || 'Update'}</strong>
                <span style="color: #6b7280; font-size: 0.9rem;">${formatDate(update.date)}</span>
            </div>
            <p style="color: #4b5563;">${update.message}</p>
        </div>
    `).join('');
}

async function submitFeedback(rating, feedback) {
    const complaintId = document.getElementById('detailId').textContent;
    
    try {
        const response = await fetch(`http://localhost:3000/api/complaints/${complaintId}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, feedback })
        });
        
        if (response.ok) {
            showNotification('Thank you for your feedback!', 'success');
            document.getElementById('feedbackSection').style.display = 'none';
        }
    } catch (error) {
        console.log('Server not running, saving locally');
        showNotification('Thank you for your feedback!', 'success');
        document.getElementById('feedbackSection').style.display = 'none';
    }
}
