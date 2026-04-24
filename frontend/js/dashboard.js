document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const authNavItem = document.getElementById('auth-nav-item');
    const loginPrompt = document.getElementById('login-prompt');
    const dashboardContent = document.getElementById('dashboard-content');

    // Theme logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    async function loadDashboard() {
        try {
            const res = await fetch('/api/dashboard/stats');
            
            if (res.status === 401 || res.status === 403) {
                // Not logged in
                dashboardContent.style.display = 'none';
                loginPrompt.style.display = 'flex';
                return;
            }

            if (!res.ok) throw new Error("Failed to load stats");

            const data = await res.json();
            
            // User is logged in, show dashboard
            loginPrompt.style.display = 'none';
            dashboardContent.style.display = 'flex';
            
            // Setup Logout button
            if (authNavItem) {
                authNavItem.innerHTML = '<a href="#" id="logout-btn" class="btn-primary" style="background:transparent;border:1px solid currentColor;color:inherit;">Log Out</a>';
                document.getElementById('logout-btn').addEventListener('click', async (e) => {
                    e.preventDefault();
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                });
            }

            populateDashboard(data);

        } catch (err) {
            console.error(err);
            dashboardContent.style.display = 'none';
            loginPrompt.style.display = 'flex';
            loginPrompt.querySelector('p').textContent = "There was an error loading your dashboard. Please try again later.";
        }
    }

    function populateDashboard(data) {
        // Banner
        document.getElementById('welcome-name').textContent = `Hello, ${data.user.name.split(' ')[0]}! 👋`;

        // Stats
        document.getElementById('stat-total').textContent = data.stats.totalAssessments;
        document.getElementById('stat-symptom').textContent = data.stats.mostFrequentSymptom || 'N/A';


        // Recent Diagnoses List
        const listEl = document.getElementById('diagnoses-list');
        listEl.innerHTML = '';

        if (data.recentDiagnoses.length === 0) {
            listEl.innerHTML = `<div class="empty-list-msg">No assessments found. Start one above!</div>`;
            return;
        }

        data.recentDiagnoses.forEach(diag => {
            const dateStr = new Date(diag.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            
            let badgeClass = 'green';
            let badgeText = 'Home Care';
            if (diag.urgency === 'yellow') { badgeClass = 'yellow'; badgeText = 'See Doctor'; }
            if (diag.urgency === 'red') { badgeClass = 'red'; badgeText = 'ER Now'; }

            const card = document.createElement('div');
            card.className = 'diagnosis-card';
            card.innerHTML = `
                <div class="diagnosis-header">
                    <div class="diagnosis-title-group">
                        <span class="urgency-badge ${badgeClass}">${badgeText}</span>
                        <h3 class="diagnosis-title">${diag.title}</h3>
                    </div>
                    <span class="diagnosis-date">${dateStr}</span>
                </div>
                <p class="diagnosis-symptoms"><strong>Symptoms:</strong> ${diag.symptomsSummary.join(', ') || 'Not specified'}</p>
                <div class="diagnosis-actions">
                    <a href="/chat?id=${diag._id}" class="btn-action view">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        View Chat
                    </a>
                    <button class="btn-action download" data-diag='${JSON.stringify(diag).replace(/'/g, "&#39;")}'>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                        Download PDF
                    </button>
                </div>
            `;
            listEl.appendChild(card);
        });

        // Add PDF listeners
        document.querySelectorAll('.btn-action.download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diagData = JSON.parse(e.currentTarget.getAttribute('data-diag'));
                generatePDFReport(diagData);
            });
        });
    }

    // PDF Generator matching the Chat styling
    function generatePDFReport(diag) {
        const dateStr = new Date(diag.date).toLocaleString();

        let userSymptomsList = '';
        if (diag.symptomsSummary && diag.symptomsSummary.length > 0) {
            diag.symptomsSummary.forEach(item => {
                userSymptomsList += `<li style="margin-bottom: 6px;">${item.trim()}</li>`;
            });
        } else {
            userSymptomsList = '<li>No symptoms explicitly provided in this session.</li>';
        }

        let solutionsHTML = '<ul style="padding-left: 20px; margin-top: 10px;">';
        if (diag.solutionItems && diag.solutionItems.length > 0) {
            diag.solutionItems.forEach(item => {
                solutionsHTML += `<li style="margin-bottom: 8px;">${item.trim()}</li>`;
            });
        } else {
            solutionsHTML += '<li>No solutions recorded.</li>';
        }
        solutionsHTML += '</ul>';

        let medicinesSection = '';
        if (diag.medicineItems && diag.medicineItems.length > 0) {
            let medicinesHTML = '<ul style="padding-left: 20px; margin-top: 10px;">';
            diag.medicineItems.forEach(item => {
                medicinesHTML += `<li style="margin-bottom: 8px;">${item.trim()}</li>`;
            });
            medicinesHTML += '</ul>';
            
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const isDark = currentTheme === 'dark';
            const textColor = isDark ? '#f3f4f6' : '#000000';
            const borderColor = isDark ? '#374151' : '#cccccc';

            medicinesSection = `
            <div style="margin-bottom: 20px;">
                <h2 style="color: ${textColor}; border-bottom: 1px solid ${borderColor}; padding-bottom: 4px; margin-top: 0; font-size: 14px;">4. Recommended Medicines / Treatments</h2>
                <div style="line-height: 1.4; color: ${textColor};">${medicinesHTML}</div>
            </div>`;
        }

        const currentTheme = document.documentElement.getAttribute('data-theme');
        const isDark = currentTheme === 'dark';

        const bgColor = isDark ? '#111827' : '#ffffff';
        const textColor = isDark ? '#f3f4f6' : '#000000';
        const mutedTextColor = isDark ? '#9ca3af' : '#555555';
        const borderColor = isDark ? '#374151' : '#cccccc';

        const reportDiv = document.createElement('div');
        reportDiv.style.fontFamily = 'Georgia, "Times New Roman", serif';
        reportDiv.style.fontSize = '11px';
        reportDiv.innerHTML = `
            <div style="background-color: ${bgColor}; padding: 40px; min-height: 100vh;">
                <div style="text-align: center; border-bottom: 2px solid ${textColor}; padding-bottom: 12px; margin-bottom: 20px;">
                    <h1 style="color: ${textColor}; margin: 0; font-size: 20px; text-transform: uppercase;">Medical Triage Report</h1>
                    <p style="color: ${mutedTextColor}; margin-top: 6px; font-size: 11px;">Date Generated: ${dateStr}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h2 style="color: ${textColor}; border-bottom: 1px solid ${borderColor}; padding-bottom: 4px; margin-top: 0; font-size: 14px;">1. Reported Symptoms</h2>
                    <ul style="padding-left: 15px; margin-top: 6px; line-height: 1.4; color: ${textColor};">
                        ${userSymptomsList}
                    </ul>
                </div>

                <div style="margin-bottom: 20px;">
                    <h2 style="color: ${textColor}; border-bottom: 1px solid ${borderColor}; padding-bottom: 4px; margin-top: 0; font-size: 14px;">2. AI Triage Verdict</h2>
                    <p style="line-height: 1.4; font-weight: bold; margin-bottom: 0; color: ${textColor};">${diag.title}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h2 style="color: ${textColor}; border-bottom: 1px solid ${borderColor}; padding-bottom: 4px; margin-top: 0; font-size: 14px;">3. Recommended Action Plan & Solutions</h2>
                    <div style="line-height: 1.4; color: ${textColor};">${solutionsHTML}</div>
                </div>
                
                ${medicinesSection}
                
                <div style="margin-top: 50px; padding-top: 15px; border-top: 1px solid ${borderColor}; font-size: 10px; color: ${mutedTextColor}; text-align: justify; line-height: 1.4;">
                    <p><strong>Disclaimer:</strong> This report is generated by an AI triage system and is for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of emergency, immediately contact local emergency services.</p>
                </div>
            </div>
        `;

        const opt = {
            margin:       0.75,
            filename:     'Medical_Triage_Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(reportDiv).save();
        } else {
            alert('PDF generation library is not loaded. Please try again later.');
        }
    }

    loadDashboard();
});