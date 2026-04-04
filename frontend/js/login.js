document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            console.log("Form intercepted");
            e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Login failed");
            return;
        }
        localStorage.setItem('token', data.token);
        const redirectUrl = localStorage.getItem('redirectUrl');

        if (redirectUrl) {
            localStorage.removeItem('redirectUrl');
            window.location.href = redirectUrl;
        } else {
            window.location.href = '/dashboard';
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }
});
    }

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
