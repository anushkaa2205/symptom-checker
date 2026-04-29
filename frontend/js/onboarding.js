let currentStep = 1;
const TOTAL_STEPS = 3;

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("onboardingForm");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
    }
    await loadExistingProfile();
    updateProgress();
    form.addEventListener("input", updateProgress);
    form.addEventListener("submit", handleSubmit);

    showStep(1);

    document.getElementById("btnNext").addEventListener("click", () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
            document.querySelector(".form-card-glass").scrollTop = 0;
        }
    });

    document.getElementById("btnPrev").addEventListener("click", () => {
        currentStep--;
        showStep(currentStep);
        document.querySelector(".form-card-glass").scrollTop = 0;
    });

    document.getElementById("height").addEventListener("input", calculateBMI);
    document.getElementById("weight").addEventListener("input", calculateBMI);
});

function showStep(step) {
    document.querySelectorAll(".step-section").forEach(s => s.classList.add("hidden"));
    const active = document.querySelector(`.step-section[data-step="${step}"]`);
    if (active) active.classList.remove("hidden");

    document.querySelectorAll(".step-node").forEach(node => {
        const n = parseInt(node.dataset.step);
        node.classList.remove("active", "done");
        if (n === step) node.classList.add("active");
        else if (n < step) node.classList.add("done");
    });

    const c1 = document.getElementById("connector-1");
    const c2 = document.getElementById("connector-2");
    if (c1) c1.classList.toggle("done", step > 1);
    if (c2) c2.classList.toggle("done", step > 2);

    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnComplete = document.getElementById("btnComplete");

    if (step === 1) {
        btnPrev.classList.add("hidden");
        btnNext.classList.remove("hidden");
        btnComplete.classList.add("hidden");
    } else if (step === TOTAL_STEPS) {
        btnPrev.classList.remove("hidden");
        btnNext.classList.add("hidden");
        btnComplete.classList.remove("hidden");
    } else {
        btnPrev.classList.remove("hidden");
        btnNext.classList.remove("hidden");
        btnComplete.classList.add("hidden");
    }
}

function validateStep(step) {
    let isValid = true;
    const section = document.querySelector(`.step-section[data-step="${step}"]`);
    if (!section) return true;

    const required = section.querySelectorAll("[required]");
    required.forEach(field => {
        field.classList.remove("invalid");
        const errId = "err-" + field.id;
        const errEl = document.getElementById(errId);

        if (!field.value.trim()) {
            field.classList.add("invalid");
            if (errEl) errEl.style.display = "block";
            isValid = false;
            return;
        }

        if (field.id === "age") {
            const v = parseInt(field.value);
            if (isNaN(v) || v < 1 || v > 120) {
                field.classList.add("invalid");
                if (errEl) errEl.style.display = "block";
                isValid = false;
                return;
            }
        }

        if (field.id === "height") {
            const v = parseFloat(field.value);
            if (isNaN(v) || v < 50 || v > 300) {
                field.classList.add("invalid");
                if (errEl) errEl.style.display = "block";
                isValid = false;
                return;
            }
        }

        if (field.id === "weight") {
            const v = parseFloat(field.value);
            if (isNaN(v) || v < 10 || v > 500) {
                field.classList.add("invalid");
                if (errEl) errEl.style.display = "block";
                isValid = false;
                return;
            }
        }

        if (errEl) errEl.style.display = "none";
    });

    required.forEach(field => {
        field.addEventListener("input", () => {
            field.classList.remove("invalid");
            const errEl = document.getElementById("err-" + field.id);
            if (errEl) errEl.style.display = "none";
        }, { once: true });
    });

    if (!isValid) {
        const first = section.querySelector(".invalid");
        if (first) first.focus();
    }

    return isValid;
}

function calculateBMI() {
    const heightCm = parseFloat(document.getElementById("height").value);
    const weightKg = parseFloat(document.getElementById("weight").value);
    const bmiValue = document.getElementById("bmiValue");
    const bmiCategory = document.getElementById("bmiCategory");

    if (!bmiValue || !bmiCategory) return;

    if (!heightCm || !weightKg || heightCm < 50 || weightKg < 10) {
        bmiValue.textContent = "—";
        bmiCategory.textContent = "Enter height & weight";
        bmiCategory.className = "bmi-category";
        return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    bmiValue.textContent = bmi.toFixed(1);

    bmiCategory.className = "bmi-category";
    if (bmi < 18.5) {
        bmiCategory.textContent = "Underweight";
        bmiCategory.classList.add("underweight");
    } else if (bmi < 25) {
        bmiCategory.textContent = "Normal";
        bmiCategory.classList.add("normal");
    } else if (bmi < 30) {
        bmiCategory.textContent = "Overweight";
        bmiCategory.classList.add("overweight");
    } else {
        bmiCategory.textContent = "Obese";
        bmiCategory.classList.add("obese");
    }
}

function showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.classList.add("visible");
    }
    setTimeout(() => {
        window.location.href = "/profile";
    }, 2500);
}

function updateProgress() {
    const form = document.getElementById("onboardingForm");
    const inputs = form.querySelectorAll("input[required], select[required]");
    let filled = 0;
    inputs.forEach((input) => {
        if (input.value.trim() !== "") filled++;
    });
    const percent = Math.round((filled / inputs.length) * 100);
    const ring = document.querySelector(".progress-ring");
    const percentText = document.querySelector(".ring-core .percent");

    if (ring) {
        ring.style.background = `conic-gradient(var(--brand-primary) ${percent * 3.6}deg, var(--border-color) 0deg)`;
    }
    if (percentText) {
        percentText.textContent = `${percent}%`;
    }
    const dots = document.querySelectorAll(".indicator .dot");
    dots.forEach(dot => { dot.style.background = "var(--border-color)"; });
    if (percent > 0 && dots[0]) dots[0].style.background = "var(--brand-primary)";
    if (percent > 50 && dots[1]) dots[1].style.background = "var(--brand-primary)";
    if (percent === 100 && dots[2]) dots[2].style.background = "var(--brand-primary)";
}

function validateForm() {
    const form = document.getElementById("onboardingForm");
    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");
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

async function loadExistingProfile() {
    try {
        const res = await fetch("/api/auth/profile", {
            method: "GET",
            credentials: "include"
        });
        if (!res.ok) {
            throw new Error("Failed to fetch profile data");
        }
        const user = await res.json();
        console.log("Fetched profile:", user);
        const hp = user.healthProfile || {};
        document.getElementById("age").value = hp.age || "";
        document.getElementById("gender").value = hp.gender || "";
        document.getElementById("height").value = hp.height || "";
        document.getElementById("weight").value = hp.weight || "";
        document.getElementById("bloodGroup").value = hp.bloodGroup || "";
        document.getElementById("allergies").value = hp.allergies?.join(", ") || "";
        document.getElementById("medications").value = hp.medications?.join(", ") || "";
        document.getElementById("chronicConditions").value = hp.chronicConditions?.join(", ") || "";
        document.getElementById("previousMedicalHistory").value = hp.previousMedicalHistory?.join(", ") || "";
        document.getElementById("emergencyContact").value = hp.emergencyContact?.phone || "";
        calculateBMI();
    } catch (error) {
        console.error("Error loading profile data:", error);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const form = document.getElementById("onboardingForm");
    if (!validateForm()) {
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
    }
    const data = {
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        height: document.getElementById("height").value,
        weight: document.getElementById("weight").value,
        bloodGroup: document.getElementById("bloodGroup").value,
        allergies: document.getElementById("allergies").value.split(",").map(i => i.trim()).filter(i => i !== ""),
        medications: document.getElementById("medications").value.split(",").map(i => i.trim()).filter(i => i !== ""),
        chronicConditions: document.getElementById("chronicConditions").value.split(",").map(i => i.trim()).filter(i => i !== ""),
        previousMedicalHistory: document.getElementById("previousMedicalHistory").value.split(",").map(i => i.trim()).filter(i => i !== ""),
        emergencyContact: {
            phone: document.getElementById("emergencyContact").value
        }
    };
    const btn = document.getElementById("btnComplete");
    btn.innerHTML = "Saving Profile...";
    btn.disabled = true;
    try {
        const res = await fetch("/api/auth/complete-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            showSuccessModal();
        } else {
            btn.innerHTML = `Complete Setup <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
            btn.disabled = false;
        }
    } catch (error) {
        console.error(error);
        btn.innerHTML = `Complete Setup <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        btn.disabled = false;
    }
}