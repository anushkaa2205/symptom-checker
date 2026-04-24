document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.auth-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
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
                    credentials: 'include', 
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Login failed");
                    return;
                }
                const redirectUrl = localStorage.getItem('redirectUrl');

                if (redirectUrl) {
                    localStorage.removeItem('redirectUrl');
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = '/dashboard';
                }

            } catch (error) {
                console.error("Login error:", error);
                alert("Something went wrong. Try again.");
            }
        });
    }

});

const googleBtn = document.querySelector('.google-btn');

if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        window.location.href = "/auth/google";
    });
}