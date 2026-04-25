async function loadNavbar() {
    const navbar = document.getElementById("navbar");

    try {
        const response = await fetch('/pages/navbar.html');
        const html = await response.text();
        navbar.innerHTML = html;

        // Ensure navbar.css is loaded
        if (!document.querySelector('link[href="/css/navbar.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/navbar.css';
            document.head.appendChild(link);
        }

        setupTheme();
        setupLogout();
        highlightActiveLink();
    } catch (error) {
        console.error("Error loading navbar:", error);
    }
}

function highlightActiveLink() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-center a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === path || (path === '/' && href === '/dashboard')) {
            link.classList.add('active');
        }
    });
}

function setupTheme() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    function updateIcon() {
        if(document.body.classList.contains("dark") || document.documentElement.getAttribute('data-theme') === 'dark'){
            themeToggle.textContent = "☀️";
        } else {
            themeToggle.textContent = "🌙";
        }
    }

    // Set initial state based on localStorage or document attribute
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark') {
        document.body.classList.add("dark");
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    updateIcon();

    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark") || document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (!isDark) {
            document.body.classList.add("dark");
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem("theme", "light");
        }

        updateIcon();
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            window.location.href = "/login";
        } catch (error) {
            console.error(error);
            // Fallback for different API routes just in case
            try {
                await fetch("/logout", {
                    method: "POST",
                    credentials: "include"
                });
                window.location.href = "/login";
            } catch (err) {
                console.error(err);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
});