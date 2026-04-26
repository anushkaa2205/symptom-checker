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
            if (insightTextEl) insightTextEl.textContent = "Start your first health assessment to get personalized insights and AI-driven analysis.";
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
                recommendationEl.textContent = "Welcome to Medora. We are ready to assist you when you need a health assessment.";
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
        const dateStr = new Date(diag.date).toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const buildList = (arr, fallback) => {
            if (!arr || arr.length === 0) return `<li>${fallback}</li>`;
            return arr.map(item => `<li style="margin-bottom: 8px;">${item.trim()}</li>`).join('');
        };

        const userSymptomsList = buildList(diag.symptomsSummary, 'No symptoms explicitly provided.');
        const solutionsList = buildList(diag.solutionItems, 'No solutions recorded.');
        
        let medicinesSection = '';
        if (diag.medicineItems && diag.medicineItems.length > 0) {
            const medList = buildList(diag.medicineItems, '');
            medicinesSection = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #0ea5e9; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px;">Recommended Medicines / Treatments</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6; font-size: 14px;">
                        ${medList}
                    </ul>
                </div>
            `;
        }

        const urgencyColor = diag.urgency === 'red' ? '#ef4444' : (diag.urgency === 'yellow' ? '#f59e0b' : '#10b981');
        const urgencyText = diag.urgency === 'red' ? 'Critical' : (diag.urgency === 'yellow' ? 'Moderate' : 'Routine');

        const reportDiv = document.createElement('div');
        reportDiv.innerHTML = `
            <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; background: #fff;">
                <!-- Header -->
                <div style="border-bottom: 3px solid #0ea5e9; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="color: #0ea5e9; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">MEDORA</h1>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #64748b; font-weight: 500;">AI Medical Assessment Report</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Generated on</p>
                        <p style="margin: 2px 0 0; font-size: 13px; color: #334155; font-weight: 600;">${dateStr}</p>
                    </div>
                </div>

                <!-- Assessment Verdict Banner -->
                <div style="background-color: #f8fafc; border-left: 4px solid ${urgencyColor}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 6px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Assessment Verdict</h2>
                        <p style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 600; line-height: 1.3;">${diag.title || 'Unknown'}</p>
                    </div>
                    <div style="margin-left: 20px; text-align: right;">
                        <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: ${urgencyColor}20; color: ${urgencyColor}; border: 1px solid ${urgencyColor}40;">
                            ${urgencyText} Priority
                        </span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column;">
                    <!-- Symptoms Section -->
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #0ea5e9; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px;">Reported Symptoms</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6; font-size: 14px;">
                            ${userSymptomsList}
                        </ul>
                    </div>

                    <!-- Action Plan Section -->
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #0ea5e9; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px;">Recommended Action Plan</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6; font-size: 14px;">
                            ${solutionsList}
                        </ul>
                    </div>
                    
                    <!-- Medicines Section -->
                    ${medicinesSection}
                </div>

                <!-- Footer Disclaimer -->
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: justify; background-color: #f8fafc; padding: 15px; border-radius: 6px;">
                    <p style="margin: 0;"><strong>Disclaimer:</strong> This report is generated by Medora's AI assessment system and is intended for informational purposes only. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of a medical emergency, immediately contact your local emergency services.</p>
                </div>
            </div>
        `;

        const opt = {
            margin: 0.5,
            filename: 'Medora_Assessment_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
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