async function loadNavbar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    try {
        // One request; the server sends no-cache for HTML, so it's revalidated (cheap 304) not re-downloaded.
        const response = await fetch('/pages/navbar.html');
        const html = await response.text();
        navbar.innerHTML = html;
        if (!document.querySelector('link[href="/css/navbar.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/navbar.css';
            document.head.appendChild(link);
        }
        setupTheme();
        setupMobileMenu();
        await checkAuthStatus();
        setupLogout();
        highlightActiveLink();
    } catch (error) {
        console.error("Navbar Load Error:", error);
    }
}
async function checkAuthStatus() {
    const navbar = document.getElementById("navbar");
    try {
        // /status always answers 200, so logged-out visitors don't get a 401 error in the console.
        const res = await fetch('/api/auth/status', {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });
        const data = res.ok ? await res.json() : { loggedIn: false };
        if (data.loggedIn) {
            navbar.classList.add("auth-logged-in");
            navbar.classList.remove("auth-logged-out");
        } else {
            navbar.classList.add("auth-logged-out");
            navbar.classList.remove("auth-logged-in");
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        navbar.classList.add("auth-logged-out");
        navbar.classList.remove("auth-logged-in");
    }
}
function highlightActiveLink() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
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
    const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    function updateIcon() {
        const isDark = document.body.classList.contains("dark") || document.documentElement.getAttribute('data-theme') === 'dark';
        themeToggle.innerHTML = isDark ? sunIcon : moonIcon;
    }
    const savedTheme = localStorage.getItem("theme");
if (!savedTheme || savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
} else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
} 
    updateIcon();
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark") || document.documentElement.getAttribute('data-theme') === 'dark';
        if (!isDark) {
            document.documentElement.classList.add("dark");
            document.body.classList.add("dark");
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            document.body.classList.remove("dark");
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem("theme", "light");
        }
        updateIcon();
    });
}
function setupMobileMenu() {
    const nav = document.querySelector(".main-navbar");
    const btn = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");
    if (!nav || !btn || !menu) return;
    const setOpen = (open) => {
        nav.classList.toggle("menu-open", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("menu-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a, button")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", (e) => { if (!nav.contains(e.target)) setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 768) setOpen(false); });
}
function setupLogout() {
    document.querySelectorAll("[data-logout]").forEach((logoutBtn) => logoutBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                sessionStorage.setItem('pendingToast', JSON.stringify({ message: 'Logged out successfully', type: 'success' }));
                localStorage.removeItem('theme');
                window.location.href = '/';
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    }));
}
document.addEventListener("DOMContentLoaded", loadNavbar);