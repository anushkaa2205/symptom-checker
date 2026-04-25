const form = document.getElementById("onboardingForm");
const themeToggle = document.getElementById("themeToggle");

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    themeToggle.textContent = "🌙";
}else{
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        localStorage.setItem("theme","dark");
        themeToggle.textContent = "🌙";
    } else{
        localStorage.setItem("theme","light");
        themeToggle.textContent = "☀️";
    }
});
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        height: document.getElementById("height").value,
        weight: document.getElementById("weight").value,
        bloodGroup: document.getElementById("bloodGroup").value,

        allergies: document
            .getElementById("allergies")
            .value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== ""),

        medications: document
            .getElementById("medications")
            .value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== ""),

        chronicConditions: document
            .getElementById("chronicConditions")
            .value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== ""),

        previousMedicalHistory: document
            .getElementById("previousMedicalHistory")
            .value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== ""),

        emergencyContact: document.getElementById("emergencyContact").value
    };

    try {
        const res = await fetch("/api/auth/complete-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert("Profile completed successfully!");
            window.location.href = "/dashboard";
        } else {
            alert(result.message || result.error || "Something went wrong");
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
});