// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggle');
const html = document.documentElement;

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    });
}

// GSAP Animations
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== 'undefined') {
        gsap.from("header", { y: -20, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
        
        gsap.from(".gsap-hero > *", {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.fromTo(entry.target, 
                        { y: 40, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                    );
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.gsap-scroll').forEach(el => observer.observe(el));
    }
});
