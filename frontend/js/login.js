document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form action for mock UI testing
            
            // Collect mock credentials
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email && password) {
                // Simulate successful login
                localStorage.setItem('isLoggedIn', 'true');
                
                // Check if we have a redirect intent
                const redirectUrl = localStorage.getItem('redirectUrl');
                
                if (redirectUrl) {
                    localStorage.removeItem('redirectUrl'); // Clear it
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                alert("Please fill in both fields.");
            }
        });
    }

    // Google Sign in mock
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'true');
            const redirectUrl = localStorage.getItem('redirectUrl');
            if (redirectUrl) {
                localStorage.removeItem('redirectUrl');
                window.location.href = redirectUrl;
            } else {
                window.location.href = '/dashboard';
            }
        });
    }
});
