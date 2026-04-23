function checkPassword(){
    const pass=document.getElementById("password").value;
    const confirmpass=document.getElementById("confirmPassword").value;
    const mess=document.getElementById("mess");
    if(confirmpass.length==0){
        mess.innerHTML="";
    }
    if(pass===confirmpass){
        mess.innerHTML="";
    }
    else{
        mess.innerHTML="Password does not match";
        mess.style.color="red";
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const Fname = document.getElementById("Fname").value.trim();
            const Lname = document.getElementById("Lname").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();
            const googleBtn = document.getElementById("google-register-btn");

            if (!Fname || !Lname || !email || !password) {
                alert("Please fill all fields");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

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
                    return;
                }
                window.location.href = '/dashboard';

            } catch (error) {
                console.error("Register error:", error);
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