document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const recentChatsList = document.getElementById('recent-chats-list');
    const newChatBtn = document.querySelector('.new-chat');
    
    let chatHistory = [];
    let currentChatId = null;
    let userName = 'there';
    
    // Set greeting
    const greetingText = document.getElementById('greeting-text');
    let emptyStateHTML = `
        <div class="empty-state" id="empty-state">
            <h2 id="greeting-text">Hello, there!</h2>
            <p>How can I help you today?</p>
        </div>
        <div class="message bot-message" style="opacity: 1; margin-top: 2rem; align-self: flex-start; max-width: 80%;">
            <div class="avatar bot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="message-content">
                <p>Please enter your symptoms below so I can begin your assessment.</p>
            </div>
        </div>
    `;

    async function initGreeting() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                userName = data.name;
                
                const authNavItem = document.getElementById('auth-nav-item');
                if (authNavItem) {
                    authNavItem.innerHTML = '<a href="#" id="logout-btn">Log Out</a>';
                    document.getElementById('logout-btn').addEventListener('click', async (e) => {
                        e.preventDefault();
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.reload();
                    });
                }
            }
        } catch (e) {
            console.error("Could not fetch user name", e);
        }
        
        const displayName = userName === 'there' ? 'there!' : `${userName}!`;
        if (greetingText) {
            greetingText.textContent = `Hello, ${displayName}`;
        }
        emptyStateHTML = `
            <div class="empty-state" id="empty-state">
                <h2 id="greeting-text">Hello, ${displayName}</h2>
                <p>How can I help you today?</p>
            </div>
            <div class="message bot-message" style="opacity: 1; margin-top: 2rem; align-self: flex-start; max-width: 80%;">
                <div class="avatar bot-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div class="message-content">
                    <p>Please enter your symptoms below so I can begin your assessment.</p>
                </div>
            </div>
        `;
    }
    
    initGreeting();

    if(themeToggleBtn){
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        });
    }
    
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;
        
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        appendMessage('user', text);
        chatInput.value = '';
        
        if (sendBtn) sendBtn.disabled = true;
        if (chatInput) chatInput.disabled = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="avatar bot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        if (chatContainer) {
            chatContainer.appendChild(typingDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text, history: chatHistory })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Failed to get response');
            }

            const data = await response.json();
            
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
            
            chatHistory.push({ sender: 'user', text: text });
            chatHistory.push({ sender: 'bot', text: data.reply });
            
            appendMessage('bot', data.reply, false);
            
            // Auto-save the chat
            saveCurrentChat();
            
        } catch (error) {
            console.error(error);
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
            appendMessage('bot', error.message || 'Sorry, there was an error processing your request. Please try again.');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (chatInput) chatInput.disabled = false;
            if (chatInput) chatInput.focus();
        }
    }
    function appendMessage(sender, text, showButton = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        if (sender === 'bot') {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar bot-avatar';
            avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
            messageDiv.appendChild(avatarDiv);
        } else if (sender === 'user') {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar user-avatar';
            avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
            messageDiv.appendChild(avatarDiv);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'bot') {
            if (text.startsWith('VERDICT|')) {
                // Parse verdict string
                const parts = text.split('|');
                const urgency = parts[1] ? parts[1].trim().toLowerCase() : 'green';
                const issue = parts[2] || 'Assessment Complete';
                const solutionRaw = parts[3] || 'Consult a medical professional for more details.';
                const medicinesRaw = parts[4] || 'None';
                const symptomsRaw = parts[5] || 'None';
                
                const solutionItems = solutionRaw.split('~').filter(item => item.trim() !== '');
                const medicineItems = medicinesRaw.split('~').filter(item => item.trim() !== '' && item.trim().toLowerCase() !== 'none');
                const symptomItems = symptomsRaw.split('~').filter(item => item.trim() !== '' && item.trim().toLowerCase() !== 'none');
                
                let solutionHTML = '<ul class="verdict-list" style="list-style-type: disc; margin-left: 20px; margin-top: 6px; margin-bottom: 0;">';
                solutionItems.forEach(item => {
                    solutionHTML += `<li style="margin-bottom: 4px;">${item.trim()}</li>`;
                });
                solutionHTML += '</ul>';

                let medicineHTML = '';
                if (medicineItems.length > 0) {
                    medicineHTML = '<div class="verdict-section" style="margin-top: 12px;"><strong>Medicines & Treatments:</strong><ul class="verdict-list" style="list-style-type: disc; margin-left: 20px; margin-top: 6px; margin-bottom: 0;">';
                    medicineItems.forEach(item => {
                        medicineHTML += `<li style="margin-bottom: 4px;">${item.trim()}</li>`;
                    });
                    medicineHTML += '</ul></div>';
                }
                
                messageDiv.classList.add('verdict-bubble', `verdict-${urgency}`);
                
                contentDiv.innerHTML = `
                    <div class="verdict-header">
                        <span class="verdict-icon"></span>
                        <span class="verdict-title">Triage Verdict</span>
                    </div>
                    <div class="verdict-section" style="margin-bottom: 12px;">
                        <strong>Issue:</strong> <span>${issue}</span>
                    </div>
                    <div class="verdict-section">
                        <strong>Action Plan:</strong> <div>${solutionHTML}</div>
                    </div>
                    ${medicineHTML}
                `;

                let downloadPdfBtn = document.createElement('button');
                downloadPdfBtn.innerHTML = `<svg style="display:inline; width:16px; height:16px; margin-right:6px; vertical-align:text-bottom;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Download PDF Report`;
                downloadPdfBtn.className = "btn-secondary";
                downloadPdfBtn.style.marginTop = "15px";
                downloadPdfBtn.style.display = "inline-flex";
                downloadPdfBtn.style.alignItems = "center";
                downloadPdfBtn.style.fontSize = "14px";
                downloadPdfBtn.style.padding = "8px 16px";
                downloadPdfBtn.style.backgroundColor = "#4f46e5";
                downloadPdfBtn.style.color = "white";
                downloadPdfBtn.style.border = "none";
                downloadPdfBtn.style.borderRadius = "6px";
                downloadPdfBtn.style.cursor = "pointer";
                downloadPdfBtn.style.transition = "all 0.2s ease";
                downloadPdfBtn.onmouseover = () => { downloadPdfBtn.style.opacity = "0.9"; };
                downloadPdfBtn.onmouseout = () => { downloadPdfBtn.style.opacity = "1"; };
                
                downloadPdfBtn.addEventListener('click', () => {
                    if (typeof generatePDFReport === 'function') {
                        generatePDFReport(issue, solutionItems, medicineItems, symptomItems);
                    }
                });
                
                contentDiv.appendChild(downloadPdfBtn);
            } else {
                contentDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
            }
        } else {
            contentDiv.textContent = text;
        }

        if (showButton) {
            const btn = document.createElement('button');
            btn.textContent = "View Detailed Report";
            btn.className = "btn-primary";
            btn.style.marginTop = "15px";
            btn.style.display = "block";
            btn.style.fontSize = "14px";
            btn.style.padding = "10px 20px";
            btn.addEventListener('click', () => {
                if (localStorage.getItem('isLoggedIn') === 'true') {
                    window.location.href = '/dashboard';
                } else {
                    localStorage.setItem('redirectUrl', '/dashboard');
                    window.location.href = '/login';
                }
            });
            contentDiv.appendChild(btn);
        }

        messageDiv.appendChild(contentDiv);

        if(chatContainer){
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    async function saveCurrentChat() {
        try {
            const response = await fetch('/api/chat/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: currentChatId, history: chatHistory })
            });
            if (response.ok) {
                const data = await response.json();
                if (!currentChatId && data.chatId) {
                    currentChatId = data.chatId;
                    fetchRecentChats(); // refresh sidebar to show new chat
                }
            }
        } catch (err) {
            console.error("Failed to auto-save chat", err);
        }
    }

    async function fetchRecentChats() {
        if (!recentChatsList) return;
        try {
            const response = await fetch('/api/chat/history');
            if (response.ok) {
                const chats = await response.json();
                recentChatsList.innerHTML = '';
                chats.forEach(chat => {
                    const li = document.createElement('li');
                    li.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l2-9 5 18 3-9h6"/></svg> ${chat.title || 'Assessment'}`;
                    li.addEventListener('click', () => loadChat(chat._id));
                    recentChatsList.appendChild(li);
                });
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    }

    async function loadChat(chatId) {
        try {
            const response = await fetch(`/api/chat/${chatId}`);
            if (response.ok) {
                const chat = await response.json();
                currentChatId = chat._id;
                chatHistory = chat.messages || [];
                
                // Clear UI and render history
                if (chatContainer) {
                    chatContainer.innerHTML = '';
                    chatHistory.forEach(msg => {
                        appendMessage(msg.sender, msg.text, false);
                    });
                }
            }
        } catch (err) {
            console.error("Failed to load chat", err);
        }
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            currentChatId = null;
            chatHistory = [];
            if (chatContainer) {
                chatContainer.innerHTML = emptyStateHTML;
            }
        });
    }

    if(sendBtn){
        sendBtn.addEventListener('click', sendMessage);
    }
    if(chatInput){
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Load initial history
    fetchRecentChats();

    function generatePDFReport(issue, solutionItems, medicineItems, symptomItems) {
        // Collect user symptoms from AI summary (if available), otherwise fallback to raw chat history
        let userSymptomsList = '';
        if (symptomItems && symptomItems.length > 0) {
            symptomItems.forEach(item => {
                userSymptomsList += `<li style="margin-bottom: 6px;">${item.trim()}</li>`;
            });
        } else {
            userSymptomsList = chatHistory
                .filter(msg => msg.sender === 'user')
                .map(msg => `<li style="margin-bottom: 6px;">${msg.text}</li>`)
                .join('');
        }

        const dateStr = new Date().toLocaleString();

        let solutionsHTML = '<ul style="padding-left: 20px; margin-top: 10px;">';
        solutionItems.forEach(item => {
            solutionsHTML += `<li style="margin-bottom: 8px;">${item.trim()}</li>`;
        });
        solutionsHTML += '</ul>';

        const currentTheme = document.documentElement.getAttribute('data-theme');
        const isDark = currentTheme === 'dark';

        const bgColor = isDark ? '#111827' : '#ffffff';
        const textColor = isDark ? '#f3f4f6' : '#000000';
        const mutedTextColor = isDark ? '#9ca3af' : '#555555';
        const borderColor = isDark ? '#374151' : '#cccccc';

        let medicinesSection = '';
        if (medicineItems && medicineItems.length > 0) {
            let medicinesHTML = '<ul style="padding-left: 20px; margin-top: 10px;">';
            medicineItems.forEach(item => {
                medicinesHTML += `<li style="margin-bottom: 8px;">${item.trim()}</li>`;
            });
            medicinesHTML += '</ul>';
            
            medicinesSection = `
            <div style="margin-bottom: 20px;">
                <h2 style="color: ${textColor}; border-bottom: 1px solid ${borderColor}; padding-bottom: 4px; margin-top: 0; font-size: 14px;">4. Recommended Medicines / Treatments</h2>
                <div style="line-height: 1.4; color: ${textColor};">${medicinesHTML}</div>
            </div>`;
        }

        // Create a hidden div for the PDF content
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
                        ${userSymptomsList || '<li>No symptoms explicitly provided in this session.</li>'}
                    </ul>
                </div>

                <div style="margin-bottom: 20px;">
                    <h2 style="color: ${textColor}; border-bottom: 1px solid ${borderColor}; padding-bottom: 4px; margin-top: 0; font-size: 14px;">2. AI Triage Verdict</h2>
                    <p style="line-height: 1.4; font-weight: bold; margin-bottom: 0; color: ${textColor};">${issue}</p>
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
});
