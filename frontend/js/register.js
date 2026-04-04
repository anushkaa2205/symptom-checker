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

    form.addEventListener('submit', async (e) => {
        console.log("Register Form intercepted");
        e.preventDefault();

        const Fname = document.getElementById("Fname").value;
        const Lname = document.getElementById("Lname").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

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
                body: JSON.stringify({ Fname, Lname, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Registration failed");
                return;
            }
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    });
});