
if (!localStorage.theme) {
    localStorage.theme = 'dark';
}

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
