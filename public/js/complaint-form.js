// Complaint Form Submission Handler

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('complaintForm');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    
    // Image preview
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 300px; border-radius: 8px; margin-top: 1rem;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Get form data
            const formData = new FormData(form);
            const complaintData = {
                id: generateComplaintId(),
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                category: formData.get('category'),
                priority: formData.get('priority') || 'Medium',
                location: formData.get('location'),
                description: formData.get('description'),
                status: 'Pending',
                date: new Date().toISOString(),
                image: null
            };
            
            // Handle image if uploaded
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    complaintData.image = e.target.result;
                    submitComplaint(complaintData);
                };
                reader.readAsDataURL(imageFile);
            } else {
                submitComplaint(complaintData);
            }
        });
    }
});

function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!fullName) {
        showNotification('Please enter your full name', 'error');
        return false;
    }
    
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!category) {
        showNotification('Please select a complaint category', 'error');
        return false;
    }
    
    if (!location) {
        showNotification('Please enter the location of the issue', 'error');
        return false;
    }
    
    if (!description || description.length < 20) {
        showNotification('Please provide a detailed description (minimum 20 characters)', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function submitComplaint(complaintData) {
    try {
        const response = await fetch('http://localhost:3000/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(complaintData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess(result.id || complaintData.id);
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.log('Server not running, using local storage');
        // Fallback to localStorage
        saveToLocalStorage(complaintData);
        showSuccess(complaintData.id);
    }
}

function saveToLocalStorage(complaintData) {
    let complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    complaints.push(complaintData);
    localStorage.setItem('complaints', JSON.stringify(complaints));
}

function showSuccess(complaintId) {
    document.getElementById('complaintForm').style.display = 'none';
    const successMessage = document.getElementById('successMessage');
    const generatedId = document.getElementById('generatedComplaintId');
    
    if (successMessage && generatedId) {
        generatedId.textContent = complaintId;
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Show notification
        showNotification('Complaint submitted successfully!', 'success');
    }
}
