// Admin Authentication

// Password Toggle Function
function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(inputId + 'ToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            // Show loading state
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/admin-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('admin', JSON.stringify(data.admin));
                    localStorage.setItem('adminToken', data.token);
                    showNotification('Admin login successful!', 'success');
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    showNotification('Invalid admin credentials', 'error');
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.log('Server not running, using demo admin login');
                // Demo admin login - updated credentials
                if (email === 'admin@gmail.com' && password === 'admin1234') {
                    const admin = { email, name: 'Admin', role: 'admin' };
                    localStorage.setItem('admin', JSON.stringify(admin));
                    showNotification('Admin login successful!', 'success');
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    showNotification('Invalid credentials', 'error');
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});
