async function loadProfile() {
    try {
        const res = await fetch("/api/auth/profile", {
            credentials: "include"
        });

        const user = await res.json();

        document.getElementById("userName").textContent =
            `${user.Fname} ${user.Lname}`;

        document.getElementById("userEmail").textContent =
            user.email;

        document.getElementById("age").textContent =
            user.healthProfile?.age || "N/A";

        document.getElementById("gender").textContent =
            user.healthProfile?.gender || "N/A";

        document.getElementById("height").textContent =
            user.healthProfile?.height || "N/A";

        document.getElementById("weight").textContent =
            user.healthProfile?.weight || "N/A";

        document.getElementById("bloodGroup").textContent =
            user.healthProfile?.bloodGroup || "N/A";

        document.getElementById("emergencyContact").textContent =
            user.healthProfile?.emergencyContact || "N/A";

        renderList("allergies", user.healthProfile?.allergies);
        renderList("medications", user.healthProfile?.medications);
        renderList("conditions", user.healthProfile?.chronicConditions);
        renderList("history", user.healthProfile?.previousMedicalHistory);

    } catch (error) {
        console.error(error);
    }
}

function renderList(id, items) {
    const list = document.getElementById(id);

    if (!items || items.length === 0) {
        list.innerHTML = "<li>None</li>";
        return;
    }

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}

loadProfile();