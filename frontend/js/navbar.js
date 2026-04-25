function loadNavbar() {
    const navbar = document.getElementById("navbar");

    navbar.innerHTML = `
        <nav class="main-navbar">
            <div class="nav-left">
                <a href="/dashboard" class="logo">
                    ✦ <span>Medora</span>
                </a>
            </div>

            <div class="nav-center">
                <a href="/dashboard">Dashboard</a>
                <a href="/chat">Assessment</a>
                <a href="/blogs">Blogs</a>
                <a href="/profile">Profile</a>
            </div>

            <div class="nav-right">
                <button id="themeToggle" class="theme-btn">🌙</button>
                <button id="logoutBtn" class="logout-btn">Logout</button>
            </div>
        </nav>
    `;

    setupTheme();
    setupLogout();
}
function setupTheme() {
    const themeToggle = document.getElementById("themeToggle");

    function updateIcon() {
        if(document.body.classList.contains("dark")){
            themeToggle.textContent = "☀️";
        } else {
            themeToggle.textContent = "🌙";
        }
    }

    updateIcon();

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if(document.body.classList.contains("dark")){
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }

        updateIcon();
    });
}
async function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("/logout", {
                method: "POST",
                credentials: "include"
            });

            window.location.href = "/login";

        } catch (error) {
            console.error(error);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
});