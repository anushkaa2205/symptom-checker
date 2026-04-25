function checkPassword(){
    const pass = document.getElementById("password").value;
    const confirmpass = document.getElementById("confirmPassword").value;
    const mess = document.getElementById("mess");
    
    if (confirmpass.length === 0) {
        mess.innerHTML = "";
    } else if (pass === confirmpass) {
        mess.innerHTML = "";
    } else {
        mess.innerHTML = "Passwords do not match";
        mess.style.color = "#f87171";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    // Password Toggle Logic
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🔒'; // Change icon to locked
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const Fname = document.getElementById("Fname").value.trim();
            const Lname = document.getElementById("Lname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (!Fname || !Lname || !email || !password) {
                alert("Please fill all required fields");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            const btn = form.querySelector('.register-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = "Creating Account...";
            btn.disabled = true;

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', 
                    body: JSON.stringify({ Fname, Lname, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Registration failed");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }

                // Redirect logic based on profile completion is handled by dashboard/onboarding routes
                window.location.href = '/dashboard';

            } catch (error) {
                console.error("Register error:", error);
                alert("Something went wrong. Please try again.");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            window.location.href = "/auth/google";
        });
    }
});