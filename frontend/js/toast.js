
(function () {
    function getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    window.showToast = function (message, type = 'success') {
        const container = getContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
            error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
            warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.success}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('toast-visible'));
        });

        const autoDismiss = setTimeout(() => dismissToast(toast), 2800);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoDismiss);
            dismissToast(toast);
        });
    };

    function dismissToast(toast) {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-hiding');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
            setTimeout(() => {
                if (typeof showToast === 'function') {
                    showToast('Logged in successfully', 'success');
                }
            }, 100);
            
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }

        const pending = sessionStorage.getItem('pendingToast');
        if (pending) {
            try {
                const data = JSON.parse(pending);
                setTimeout(() => {
                    showToast(data.message, data.type);
                }, 100);
            } catch (e) {
                console.error('Failed to parse pending toast:', e);
            }
            sessionStorage.removeItem('pendingToast');
        }
    });
})();
