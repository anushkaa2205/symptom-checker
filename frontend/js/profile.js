document.addEventListener("DOMContentLoaded", () => {
    loadProfile();

    const editBtn = document.getElementById("editProfileBtn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = "/onboarding";
        });
    }

    const viewHistoryBtn = document.getElementById("viewHistoryBtn");
    const historyCollapse = document.getElementById("historyCollapse");
    
    if (viewHistoryBtn && historyCollapse) {
        viewHistoryBtn.addEventListener("click", async () => {
            const isActive = viewHistoryBtn.classList.toggle("active");
            historyCollapse.classList.toggle("active");
            
            if (isActive && !historyCollapse.dataset.loaded) {
                await loadExtendedHistory();
                historyCollapse.dataset.loaded = "true";
            }
        });
    }

    const deleteProfileBtn = document.getElementById("deleteProfileBtn");
    const deleteModal = document.getElementById("deleteModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    if (deleteProfileBtn && deleteModal) {
        deleteProfileBtn.addEventListener("click", () => {
            deleteModal.classList.add("active");
        });

        cancelDeleteBtn.addEventListener("click", () => {
            deleteModal.classList.remove("active");
        });

        deleteModal.addEventListener("click", (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.remove("active");
            }
        });

        confirmDeleteBtn.addEventListener("click", async () => {
            try {
                confirmDeleteBtn.textContent = "Deleting...";
                confirmDeleteBtn.disabled = true;

                const res = await fetch("/api/auth/delete-profile", {
                    method: "DELETE",
                    credentials: "include"
                });

                if (res.ok) {
                    window.location.href = "/";
                } else {
                    const data = await res.json();
                    alert(data.error || data.message || "Failed to delete profile");
                    confirmDeleteBtn.textContent = "Delete Profile";
                    confirmDeleteBtn.disabled = false;
                }
            } catch (error) {
                console.error("Delete profile error:", error);
                alert("An error occurred. Please try again.");
                confirmDeleteBtn.textContent = "Delete Profile";
                confirmDeleteBtn.disabled = false;
            }
        });
    }

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-add")) {
            window.location.href = "/onboarding";
        }
    });

    const deleteChatModal = document.getElementById("deleteChatModalOverlay");
    const cancelDeleteChatBtn = document.getElementById("cancelDeleteChatBtn");
    const confirmDeleteChatBtn = document.getElementById("confirmDeleteChatBtn");
    const deleteChatPreviewTitle = document.getElementById("deleteChatPreviewTitle");
    const deleteChatPreviewDate = document.getElementById("deleteChatPreviewDate");

    let chatToDeleteId = null;

    if (deleteChatModal) {
        cancelDeleteChatBtn.addEventListener("click", () => {
            deleteChatModal.classList.remove("active");
        });

        confirmDeleteChatBtn.addEventListener("click", async () => {
            if (!chatToDeleteId) return;
            try {
                confirmDeleteChatBtn.disabled = true;
                const res = await fetch(`/api/chat/${chatToDeleteId}`, {
                    method: "DELETE",
                    credentials: "include"
                });

                if (res.ok) {
                    if (typeof showToast === 'function') showToast("Assessment deleted successfully", "success");
                    deleteChatModal.classList.remove("active");
                    loadRecentAssessments();
                    if (document.getElementById("historyCollapse").classList.contains("active")) {
                        loadExtendedHistory();
                    }
                } else {
                    if (typeof showToast === 'function') showToast("Failed to delete assessment", "error");
                }
            } catch (err) {
                console.error("Delete chat error:", err);
            } finally {
                confirmDeleteChatBtn.disabled = false;
            }
        });
    }

    window.deleteChatSession = function(chatId, title, date) {
        chatToDeleteId = chatId;
        if (deleteChatPreviewTitle) deleteChatPreviewTitle.textContent = title;
        if (deleteChatPreviewDate) deleteChatPreviewDate.textContent = date;
        if (deleteChatModal) deleteChatModal.classList.add("active");
    };
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

        const emergencyNum = hp?.emergencyContact?.phone || "";
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

async function loadExtendedHistory() {
    const extendedGrid = document.getElementById("extendedAssessmentGrid");
    try {
        const res = await fetch("/api/chat/history/recent", {
            method: "GET",
            credentials: "include"
        });

        if (res.ok) {
            const history = await res.json();
            renderExtendedGrid(history);
        }
    } catch (error) {
        console.error("Extended history load error:", error);
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
        const dropdown = document.querySelector('.history-dropdown-wrap');
        if (dropdown) dropdown.style.display = 'none';
        return;
    }

    const listWrapper = document.createElement("div");
    listWrapper.className = "history-list";

    history.slice(0, 5).forEach(chat => {
        listWrapper.appendChild(createAssessmentCard(chat));
    });

    grid.appendChild(listWrapper);
}

function renderExtendedGrid(history) {
    const grid = document.getElementById("extendedAssessmentGrid");
    grid.innerHTML = "";

    if (!history || history.length === 0) {
        grid.innerHTML = '<p class="empty-msg" style="padding: 20px; text-align: center;">No assessments in the last 30 days.</p>';
        return;
    }

    const listWrapper = document.createElement("div");
    listWrapper.className = "history-list";

    history.forEach(chat => {
        listWrapper.appendChild(createAssessmentCard(chat));
    });

    grid.appendChild(listWrapper);
}

function createAssessmentCard(chat) {
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
            <a href="/chat?id=${chat._id}" class="btn-icon-edit" title="Edit Assessment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </a>
            <button class="btn-icon-delete" title="Delete Assessment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `;

    const deleteBtn = card.querySelector('.btn-icon-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.deleteChatSession(chat._id, cleanTitle, dateStr);
    });

    return card;
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
