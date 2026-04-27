document.addEventListener("DOMContentLoaded", () => {
    loadProfile();

    const editBtn = document.getElementById("editProfileBtn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = "/onboarding";
        });
    }

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-add")) {
            window.location.href = "/onboarding";
        }
    });
});

async function loadProfile() {
    try {
        const res = await fetch("/api/auth/profile", {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        if (res.status === 401) {
            window.location.href = "/login";
            return;
        }

        if (!res.ok) {
            throw new Error("Failed to load profile");
        }

        const user = await res.json();
        console.log("Profile user data:", user);
        const fullName = `${user.Fname || ""} ${user.Lname || ""}`.trim();

        document.getElementById("userName").textContent =
            fullName || "User";

        document.getElementById("userEmail").textContent =
            user.email || "No email available";

        const initials =
            (user.Fname?.[0] || "") + (user.Lname?.[0] || "");

        document.getElementById("avatarInitials").textContent =
            initials.toUpperCase() || "U";

        const hp = user.healthProfile ?? {};

        document.getElementById("age").textContent =
            hp?.age ?? "--";

        document.getElementById("bloodGroup").textContent =
            hp?.bloodGroup ?? "--";

        document.getElementById("height").textContent =
            hp?.height ?? "--";

        document.getElementById("weight").textContent =
            hp?.weight ?? "--";

        const emergencyNum = hp?.emergencyContact;

        const contactDisplay =
            document.getElementById("contactDisplay");

        const noContactDisplay =
            document.getElementById("noContactDisplay");

        if (
            emergencyNum &&
            emergencyNum.trim() !== "" &&
            emergencyNum !== "N/A"
        ) {
            document.getElementById("emergencyContact").textContent =
                emergencyNum;

            contactDisplay.style.display = "block";
            noContactDisplay.style.display = "none";
        } else {
            contactDisplay.style.display = "none";
            noContactDisplay.style.display = "block";
        }

        renderPills(
            "allergies",
            hp?.allergies || []
        );

        renderPills(
            "medications",
            hp?.medications || []
        );

        renderPills(
            "conditions",
            hp?.chronicConditions || []
        );

        renderPills(
            "history",
            hp?.previousMedicalHistory || []
        );

        loadRecentAssessments();

    } catch (error) {
        console.error("Profile load error:", error);
    }
}

async function loadRecentAssessments() {
    const grid = document.getElementById("assessmentGrid");

    grid.innerHTML = `
        <div class="loading-state">
            <p>Loading recent assessments...</p>
        </div>
    `;

    try {
        const res = await fetch("/api/chat/history", {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        if (res.status === 401) {
            grid.innerHTML = `
                <p class="empty-msg">
                    Login required to view saved assessments
                </p>
            `;
            return;
        }

        if (!res.ok) {
            throw new Error("Failed to fetch history");
        }

        const history = await res.json();

        document.getElementById("totalAssessments").textContent =
            history.length;

        if (history.length > 0) {
            const latestDate = new Date(
                history[0].updatedAt
            ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });

            document.getElementById("lastCheckDate").textContent =
                latestDate;

            document.getElementById("topSymptom").textContent =
                history[0].title || "General Checkup";
        } else {
            document.getElementById("lastCheckDate").textContent =
                "No assessments yet";

            document.getElementById("topSymptom").textContent =
                "General Checkup";
        }

        renderAssessmentGrid(history);

    } catch (error) {
        console.error("Assessment load error:", error);

        grid.innerHTML = `
            <p class="empty-msg">
                Unable to load assessment history
            </p>
        `;
    }
}

function renderAssessmentGrid(history) {
    const grid = document.getElementById("assessmentGrid");
    grid.innerHTML = "";

    if (!history || history.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>No recent assessments found</p>
                <a href="/chat" class="btn btn-primary">
                    Start New Assessment
                </a>
            </div>
        `;
        return;
    }

    const listWrapper = document.createElement("div");
    listWrapper.className = "history-list";

    history.slice(0, 3).forEach(chat => {
        const dateStr = new Date(chat.updatedAt)
            .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });

        const cleanTitle =
            chat.title?.length > 40
                ? chat.title.substring(0, 40) + "..."
                : chat.title || "Assessment";

        const previewText = chat.messages?.length
            ? chat.messages[
                chat.messages.length - 1
              ].text
                  .replace("VERDICT|", "")
                  .substring(0, 90) + "..."
            : "Saved health consultation";

        const card = document.createElement("div");
        card.className = "history-card";

        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${cleanTitle}</h3>
                <span class="card-date">${dateStr}</span>
                <p class="card-preview">${previewText}</p>
            </div>

            <div class="card-actions">
                <a href="/chat?id=${chat._id}" class="btn btn-secondary btn-small">
                    View Details
                </a>
            </div>
        `;

        listWrapper.appendChild(card);
    });

    grid.appendChild(listWrapper);
}

function renderPills(id, items) {
    const list = document.getElementById(id);
    list.innerHTML = "";

    if (!items.length) {
        list.innerHTML = "<li>None</li>";
        return;
    }

    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}
