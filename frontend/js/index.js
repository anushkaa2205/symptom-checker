
if (!localStorage.theme) {
    localStorage.theme = 'dark';
}

// Apply saved theme
if (localStorage.theme === 'dark') {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    });
}

// animations
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap !== 'undefined') {
        gsap.from("header", { y: -20, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
        
        gsap.from(".hero-section > *", {
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

        document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
    }

    // card tilt effect
    const tiltElements = document.querySelectorAll('.feature-card');
    
    tiltElements.forEach(wrapper => {
        const element = wrapper.querySelector('.card-box');
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position relative to center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degree tilt
            const rotateY = ((x - centerX) / centerX) * 15;
            
            element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            element.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
});
