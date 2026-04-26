document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("onboardingForm");

    // Theme Handling
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
    }

    // Load existing profile data first
    await loadExistingProfile();

    // Update progress after prefilled values load
    updateProgress();

    // Progress updates on input change
    form.addEventListener("input", updateProgress);

    // Form submit handler
    form.addEventListener("submit", handleSubmit);
});

// ----------------------------
// Progress Ring Logic
// ----------------------------
function updateProgress() {
    const form = document.getElementById("onboardingForm");
    const inputs = form.querySelectorAll(
        "input[required], select[required]"
    );

    let filled = 0;

    inputs.forEach((input) => {
        if (input.value.trim() !== "") {
            filled++;
        }
    });

    const percent = Math.round(
        (filled / inputs.length) * 100
    );

    const ring = document.querySelector(".progress-ring");
    const percentText =
        document.querySelector(".ring-core .percent");

    if (ring) {
        ring.style.background = `
            conic-gradient(
                var(--brand-primary) ${percent * 3.6}deg,
                var(--border-color) 0deg
            )
        `;
    }

    if (percentText) {
        percentText.textContent = `${percent}%`;
    }

    // indicator dots
    const dots =
        document.querySelectorAll(".indicator .dot");

    dots.forEach(dot => {
        dot.style.background =
            "var(--border-color)";
    });

    if (percent > 0 && dots[0]) {
        dots[0].style.background =
            "var(--brand-primary)";
    }

    if (percent > 50 && dots[1]) {
        dots[1].style.background =
            "var(--brand-primary)";
    }

    if (percent === 100 && dots[2]) {
        dots[2].style.background =
            "var(--brand-primary)";
    }
}

// ----------------------------
// Validation
// ----------------------------
function validateForm() {
    const form = document.getElementById("onboardingForm");
    let isValid = true;

    const requiredFields =
        form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
        if (!field.value.trim()) {
            field.classList.add("invalid");
            isValid = false;
        } else {
            field.classList.remove("invalid");
        }
    });

    return isValid;
}

// ----------------------------
// Load Existing Profile
// ----------------------------
async function loadExistingProfile() {
    try {
        const res = await fetch("/api/auth/profile", {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) {
            throw new Error(
                "Failed to fetch profile data"
            );
        }

        const user = await res.json();
        console.log("Fetched profile:", user);

        const hp = user.healthProfile || {};

        document.getElementById("age").value =
            hp.age || "";

        document.getElementById("gender").value =
            hp.gender || "";

        document.getElementById("height").value =
            hp.height || "";

        document.getElementById("weight").value =
            hp.weight || "";

        document.getElementById("bloodGroup").value =
            hp.bloodGroup || "";

        document.getElementById("allergies").value =
            hp.allergies?.join(", ") || "";

        document.getElementById("medications").value =
            hp.medications?.join(", ") || "";

        document.getElementById("chronicConditions").value =
            hp.chronicConditions?.join(", ") || "";

        document.getElementById("previousMedicalHistory").value =
            hp.previousMedicalHistory?.join(", ") || "";

        document.getElementById("emergencyContact").value =
            hp.emergencyContact || "";

    } catch (error) {
        console.error(
            "Error loading profile data:",
            error
        );
    }
}

// ----------------------------
// Submit Profile
// ----------------------------
async function handleSubmit(e) {
    e.preventDefault();

    const form =
        document.getElementById("onboardingForm");

    if (!validateForm()) {
        const firstInvalid =
            form.querySelector(".invalid");

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return;
    }

    const data = {
        age: document.getElementById("age").value,
        gender:
            document.getElementById("gender").value,
        height:
            document.getElementById("height").value,
        weight:
            document.getElementById("weight").value,
        bloodGroup:
            document.getElementById("bloodGroup")
                .value,

        allergies: document
            .getElementById("allergies")
            .value.split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),

        medications: document
            .getElementById("medications")
            .value.split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),

        chronicConditions: document
            .getElementById("chronicConditions")
            .value.split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),

        previousMedicalHistory: document
            .getElementById(
                "previousMedicalHistory"
            )
            .value.split(",")
            .map((item) => item.trim())
            .filter((item) => item !== ""),

        emergencyContact:
            document.getElementById(
                "emergencyContact"
            ).value
    };

    const btn =
        form.querySelector(".btn-complete");

    btn.textContent = "Processing...";
    btn.disabled = true;

    try {
        const res = await fetch(
            "/api/auth/complete-profile",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                credentials: "include",
                body: JSON.stringify(data)
            }
        );

        const result = await res.json();

        if (res.ok) {
            window.location.href =
                "/profile";
        } else {
            alert(
                result.message ||
                result.error ||
                "Something went wrong"
            );

            btn.textContent =
                "Complete Setup";
            btn.disabled = false;
        }

    } catch (error) {
        console.error(error);

        alert("Server error");

        btn.textContent =
            "Complete Setup";
        btn.disabled = false;
    }
}