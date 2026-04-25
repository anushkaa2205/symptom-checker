document.addEventListener('DOMContentLoaded', () => {
    // References to UI elements
    const loginPrompt = document.getElementById('login-prompt');
    const dashboardContent = document.getElementById('dashboard-content');
    const diagnosesList = document.getElementById('diagnoses-list');

    // Fetch dashboard stats from backend
    async function fetchDashboardData() {
        try {
            const res = await fetch('/api/dashboard/stats');
            
            if (res.status === 401 || res.status === 403) {
                showLoginPrompt();
                return;
            }
            if (!res.ok) throw new Error("Failed to load dashboard data");

            const data = await res.json();
            renderDashboard(data);

        } catch (err) {
            console.error("Dashboard error:", err);
            showLoginPrompt();
        }
    }

    function showLoginPrompt() {
        if (dashboardContent) dashboardContent.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'flex';
    }

    function renderDashboard(data) {
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (dashboardContent) dashboardContent.style.display = 'block';

        const { user, stats, urgencyBreakdown, recentDiagnoses } = data;

        const firstName = user.name ? user.name.split(' ')[0] : 'User';
        const welcomeNameEl = document.getElementById('welcome-name');
        if (welcomeNameEl) welcomeNameEl.textContent = `Hello, ${firstName} 👋`;
        
        const total = (urgencyBreakdown.green || 0) + (urgencyBreakdown.yellow || 0) + (urgencyBreakdown.red || 0);
        let dominantUrgency = 'green';
        if (urgencyBreakdown.red > urgencyBreakdown.yellow && urgencyBreakdown.red > urgencyBreakdown.green) {
            dominantUrgency = 'red';
        } else if (urgencyBreakdown.yellow > urgencyBreakdown.green) {
            dominantUrgency = 'yellow';
        }

        const insightTextEl = document.getElementById('hero-insight-text');
        const riskTextEl = document.getElementById('hero-risk-text');
        const riskBadgeEl = document.getElementById('hero-risk-badge');
        const pulseDot = riskBadgeEl ? riskBadgeEl.querySelector('.pulse-dot') : null;

        if (total === 0) {
            if (insightTextEl) insightTextEl.textContent = "Start your first health assessment to get personalized insights and AI-driven triage.";
            if (riskTextEl) riskTextEl.textContent = "No Data";
        } else if (dominantUrgency === 'red') {
            if (insightTextEl) insightTextEl.textContent = "Your recent assessments indicate mostly critical symptoms. Please prioritize professional medical consultation.";
            if (riskTextEl) riskTextEl.textContent = "High Risk";
            if (pulseDot) { pulseDot.className = 'pulse-dot red'; }
        } else if (dominantUrgency === 'yellow') {
            if (insightTextEl) insightTextEl.textContent = "Monitor your symptoms closely. Some assessments show moderate risk that may require a doctor's visit.";
            if (riskTextEl) riskTextEl.textContent = "Moderate Risk";
            if (pulseDot) { pulseDot.className = 'pulse-dot yellow'; }
        } else {
            if (insightTextEl) insightTextEl.textContent = "Your recent assessments show routine symptoms. Continue monitoring your well-being.";
            if (riskTextEl) riskTextEl.textContent = "Low Risk";
            if (pulseDot) { pulseDot.className = 'pulse-dot'; }
        }

        const safeText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        
        safeText('stat-total', stats.totalAssessments || 0);
        safeText('stat-monthly', stats.monthlyAssessments || 0);
        
        const freqSymptom = stats.mostFrequentSymptom && stats.mostFrequentSymptom !== 'N/A' 
                            ? stats.mostFrequentSymptom 
                            : 'None';
        safeText('stat-symptom', freqSymptom);
        const symptomEl = document.getElementById('stat-symptom');
        if (symptomEl) symptomEl.setAttribute('title', freqSymptom);
        
        safeText('stat-urgency', stats.mostCommonUrgency || 'Low');

        let lastDateStr = 'Never';
        if (stats.lastAssessmentDate) {
            lastDateStr = new Date(stats.lastAssessmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }
        safeText('insight-last-date', lastDateStr);
        safeText('insight-freq-issue', freqSymptom);

        const recommendationEl = document.getElementById('insight-recommendation');
        if (recommendationEl) {
            if (total === 0) {
                recommendationEl.textContent = "Welcome to Medora. We are ready to assist you when you need health triage.";
            } else if (dominantUrgency === 'red') {
                recommendationEl.textContent = "Important: Multiple critical assessments detected. We strongly recommend scheduling a professional medical consultation immediately.";
            } else if (dominantUrgency === 'yellow') {
                recommendationEl.textContent = "Consider discussing your recurring moderate symptoms with a healthcare provider during your next visit.";
            } else {
                recommendationEl.textContent = "Your health patterns appear stable based on recent data. Maintain a healthy lifestyle and stay hydrated.";
            }
        }

        // donut chart
        const redCount = urgencyBreakdown.red || 0;
        const yellowCount = urgencyBreakdown.yellow || 0;
        const greenCount = urgencyBreakdown.green || 0;

        const redPct = total > 0 ? Math.round((redCount / total) * 100) : 0;
        const yellowPct = total > 0 ? Math.round((yellowCount / total) * 100) : 0;
        const greenPct = total > 0 ? Math.round((greenCount / total) * 100) : 0;

        safeText('donut-val-red', `${redPct}%`);
        safeText('donut-val-yellow', `${yellowPct}%`);
        safeText('donut-val-green', `${greenPct}%`);

        const donutEl = document.getElementById('triage-donut');
        if (donutEl) {
            if (total === 0) {
                donutEl.style.background = 'conic-gradient(var(--border-color) 0% 100%)';
            } else {
                const redDeg = (redPct / 100) * 360;
                const yellowDeg = redDeg + ((yellowPct / 100) * 360);
                
                donutEl.style.background = `conic-gradient(
                    #ef4444 0deg ${redDeg}deg, 
                    #f59e0b ${redDeg}deg ${yellowDeg}deg, 
                    #10b981 ${yellowDeg}deg 360deg
                )`;
            }
        }

        renderHistoryList(recentDiagnoses);
    }

    function renderHistoryList(diagnoses) {
        if (!diagnosesList) return;
        diagnosesList.innerHTML = '';

        if (!diagnoses || diagnoses.length === 0) {
            diagnosesList.innerHTML = `
                <div class="empty-state">
                    <p>No recent assessments found. Start one to see your history.</p>
                </div>
            `;
            return;
        }

        diagnoses.forEach(diag => {
            const dateStr = new Date(diag.date).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'short', day: 'numeric' 
            });
            
            let badgeClass = 'green';
            let badgeText = 'Routine';
            
            if (diag.urgency === 'yellow') { 
                badgeClass = 'yellow'; 
                badgeText = 'Moderate'; 
            } else if (diag.urgency === 'red') { 
                badgeClass = 'red'; 
                badgeText = 'Critical'; 
            }

            const symptoms = diag.symptomsSummary && diag.symptomsSummary.length > 0 
                ? diag.symptomsSummary.join(', ') 
                : 'No symptoms recorded';

            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title-wrap">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        <h3 class="card-title">${diag.title || 'Assessment'}</h3>
                    </div>
                    <span class="card-date">${dateStr}</span>
                </div>
                <p class="card-symptoms">${symptoms}</p>
                <div class="card-actions">
                    <a href="/chat?id=${diag._id}" class="btn btn-secondary btn-small">
                        View Details
                    </a>
                    <button class="btn btn-ghost btn-small download-pdf" data-diag='${JSON.stringify(diag).replace(/'/g, "&#39;")}'>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right:4px; vertical-align: middle;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> PDF
                    </button>
                </div>
            `;
            diagnosesList.appendChild(card);
        });

        // Attach PDF download listeners
        document.querySelectorAll('.download-pdf').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rawData = e.currentTarget.getAttribute('data-diag');
                try {
                    const diagData = JSON.parse(rawData);
                    generatePDFReport(diagData);
                } catch (err) {
                    console.error("Error parsing diagnosis data for PDF:", err);
                }
            });
        });
    }

    // Standard PDF Generator Function
    function generatePDFReport(diag) {
        const dateStr = new Date(diag.date).toLocaleString();

        const buildList = (arr, fallback) => {
            if (!arr || arr.length === 0) return `<li>${fallback}</li>`;
            return arr.map(item => `<li style="margin-bottom: 6px;">${item.trim()}</li>`).join('');
        };

        const userSymptomsList = buildList(diag.symptomsSummary, 'No symptoms explicitly provided.');
        const solutionsList = buildList(diag.solutionItems, 'No solutions recorded.');
        
        let medicinesSection = '';
        if (diag.medicineItems && diag.medicineItems.length > 0) {
            const medList = buildList(diag.medicineItems, '');
            medicinesSection = `
                <div style="margin-bottom: 20px;">
                    <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 14px;">4. Recommended Medicines / Treatments</h2>
                    <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.4;">${medList}</ul>
                </div>
            `;
        }

        const reportDiv = document.createElement('div');
        reportDiv.style.fontFamily = 'Georgia, "Times New Roman", serif';
        reportDiv.style.fontSize = '12px';
        reportDiv.style.color = '#000';
        reportDiv.style.backgroundColor = '#fff';
        reportDiv.style.padding = '40px';

        reportDiv.innerHTML = `
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px;">
                <h1 style="margin: 0; font-size: 22px; text-transform: uppercase;">Medical Triage Report</h1>
                <p style="color: #555; margin-top: 6px; font-size: 12px;">Generated on: ${dateStr}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 14px;">1. Reported Symptoms</h2>
                <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.4;">${userSymptomsList}</ul>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 14px;">2. AI Triage Verdict</h2>
                <p style="line-height: 1.4; font-weight: bold; margin-top: 10px;">${diag.title || 'Unknown'}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 14px;">3. Recommended Action Plan</h2>
                <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.4;">${solutionsList}</ul>
            </div>
            
            ${medicinesSection}
            
            <div style="margin-top: 50px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 10px; color: #666; line-height: 1.4; text-align: justify;">
                <p><strong>Disclaimer:</strong> This report is generated by an AI triage system and is for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of emergency, immediately contact local emergency services.</p>
            </div>
        `;

        const opt = {
            margin: 0.75,
            filename: 'Triage_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(reportDiv).save();
        } else {
            alert('PDF library failed to load. Please try again.');
        }
    }

    // Initialize
    fetchDashboardData();
});