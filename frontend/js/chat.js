document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatHero = document.getElementById('chat-hero');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const recentChatsList = document.getElementById('recent-chats-list');
    const newChatBtn = document.querySelector('.new-chat');
    const greetingText = document.getElementById('greeting-text');
    
    let chatHistory = [];
    let currentChatId = null;
    let userName = 'there';
    
    // Theme setup is handled by navbar.js, but we can add local tweaks if needed
    
    async function initGreeting() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                userName = data.name;
            }
        } catch (e) {
            console.error("Could not fetch user name", e);
        }
        
        const displayName = userName === 'there' ? 'there!' : `${userName}!`;
        if (greetingText) {
            greetingText.textContent = `Hello, ${displayName}`;
        }
    }
    
    initGreeting();

    // Symptom Chip Click Handlers
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const symptom = chip.getAttribute('data-symptom');
            chatInput.value = symptom;
            sendMessage();
        });
    });

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;
        
        // Hide Hero state on first message
        if (chatHero) {
            chatHero.style.display = 'none';
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
                headers: { 'Content-Type': 'application/json' },
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
            
            appendMessage('bot', data.reply);
            saveCurrentChat();
            
        } catch (error) {
            console.error(error);
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
            appendMessage('bot', error.message || 'Sorry, there was an error processing your request.');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (chatInput) chatInput.disabled = false;
            if (chatInput) chatInput.focus();
        }
    }

    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `avatar ${sender}-avatar`;
        if (sender === 'bot') {
            avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        } else {
            avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
        }
        messageDiv.appendChild(avatarDiv);

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
                
                let solutionHTML = '<ul style="list-style-type: disc; margin-left: 20px; margin-top: 6px;">';
                solutionItems.forEach(item => { solutionHTML += `<li style="margin-bottom: 4px;">${item.trim()}</li>`; });
                solutionHTML += '</ul>';

                let medicineHTML = '';
                if (medicineItems.length > 0) {
                    medicineHTML = '<div class="verdict-section"><strong>Medicines & Treatments</strong><ul style="list-style-type: disc; margin-left: 20px; margin-top: 6px;">';
                    medicineItems.forEach(item => { medicineHTML += `<li style="margin-bottom: 4px;">${item.trim()}</li>`; });
                    medicineHTML += '</ul></div>';
                }
                
                messageDiv.classList.add('verdict-bubble', `verdict-${urgency}`);
                
                contentDiv.innerHTML = `
                    <div class="verdict-header">
                        <span class="verdict-icon"></span>
                        <span class="verdict-title">Triage Verdict</span>
                    </div>
                    <div class="verdict-section">
                        <strong>Identified Issue</strong> <span>${issue}</span>
                    </div>
                    <div class="verdict-section">
                        <strong>Action Plan</strong> <div>${solutionHTML}</div>
                    </div>
                    ${medicineHTML}
                `;

                const downloadPdfBtn = document.createElement('button');
                downloadPdfBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Download Report';
                downloadPdfBtn.className = "btn-pdf"; // You can add specific styling in CSS
                downloadPdfBtn.style.marginTop = "16px";
                downloadPdfBtn.style.padding = "10px 16px";
                downloadPdfBtn.style.background = "rgba(255,255,255,0.1)";
                downloadPdfBtn.style.border = "1px solid var(--border-color)";
                downloadPdfBtn.style.color = "var(--text-primary)";
                downloadPdfBtn.style.borderRadius = "8px";
                downloadPdfBtn.style.cursor = "pointer";
                downloadPdfBtn.style.fontWeight = "600";
                downloadPdfBtn.style.fontSize = "13px";
                downloadPdfBtn.style.display = "flex";
                downloadPdfBtn.style.alignItems = "center";
                
                downloadPdfBtn.addEventListener('click', async () => {
    try {
        const authRes = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (!authRes.ok) {
    const goLogin = confirm(
        "Please login to download your medical report.\n\nClick OK to go to login page."
    );

    if (goLogin) {
        window.location.href = "/login";
    }

    return;
}

        // logged in → allow PDF download
        if (typeof generatePDFReport === 'function') {
            generatePDFReport(
                issue,
                solutionItems,
                medicineItems,
                symptomItems
            );
        }

    } catch (error) {
        console.error("Auth check failed:", error);
        alert("Something went wrong. Please try again.");
    }
});
                contentDiv.appendChild(downloadPdfBtn);
            } else {
                contentDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
            }
        } else {
            contentDiv.textContent = text;
        }

        messageDiv.appendChild(contentDiv);

        if(chatContainer){
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    async function saveCurrentChat() {
        try {
            await fetch('/api/chat/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: currentChatId, history: chatHistory })
            }).then(res => res.json()).then(data => {
                if (!currentChatId && data.chatId) {
                    currentChatId = data.chatId;
                    fetchRecentChats();
                }
            });
        } catch (err) { console.error("Failed to auto-save chat", err); }
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
                    li.setAttribute('data-id', chat._id);
                    if (currentChatId === chat._id) li.classList.add('active');
                    
                    const date = new Date(chat.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });

                    li.innerHTML = `
                        <div class="chat-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div class="chat-info">
                            <span class="chat-title">${chat.title || 'Assessment'}</span>
                            <span class="chat-date">${date}</span>
                        </div>
                    `;
                    li.addEventListener('click', () => loadChat(chat._id));
                    recentChatsList.appendChild(li);
                });
            }
        } catch (err) { console.error("Failed to fetch history", err); }
    }

    async function loadChat(chatId) {
        try {
            const response = await fetch(`/api/chat/${chatId}`);
            if (response.ok) {
                const chat = await response.json();
                currentChatId = chat._id;
                chatHistory = chat.messages || [];
                
                // Update active state in sidebar
                document.querySelectorAll('.recent-chats li').forEach(el => {
                    el.classList.toggle('active', el.getAttribute('data-id') === chatId);
                });

                if (chatHero) chatHero.style.display = 'none';
                if (chatContainer) {
                    chatContainer.innerHTML = '';
                    chatHistory.forEach(msg => appendMessage(msg.sender, msg.text));
                }
            }
        } catch (err) { console.error("Failed to load chat", err); }
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            currentChatId = null;
            chatHistory = [];
            
            // Reset active state in sidebar
            document.querySelectorAll('.recent-chats li').forEach(el => el.classList.remove('active'));

            if (chatHero) chatHero.style.display = 'flex';
            if (chatContainer) {
                chatContainer.innerHTML = '';
                chatContainer.appendChild(chatHero);
            }
        });
    }

    if(sendBtn) sendBtn.addEventListener('click', sendMessage);
    if(chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    fetchRecentChats();
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('id');
    if (chatIdFromUrl) loadChat(chatIdFromUrl);

    // Reuse generatePDFReport logic (unchanged)
    function generatePDFReport(issue, solutionItems, medicineItems, symptomItems) {
        let userSymptomsList = '';
        if (symptomItems && symptomItems.length > 0) {
            symptomItems.forEach(item => { userSymptomsList += `<li style="margin-bottom: 6px;">${item.trim()}</li>`; });
        } else {
            userSymptomsList = chatHistory.filter(msg => msg.sender === 'user').map(msg => `<li style="margin-bottom: 6px;">${msg.text}</li>`).join('');
        }

        const dateStr = new Date().toLocaleString();
        let solutionsHTML = '<ul style="padding-left: 20px; margin-top: 10px;">';
        solutionItems.forEach(item => { solutionsHTML += `<li style="margin-bottom: 8px;">${item.trim()}</li>`; });
        solutionsHTML += '</ul>';

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const bgColor = isDark ? '#0b0f1a' : '#ffffff';
        const textColor = isDark ? '#f8fafc' : '#000000';
        const reportDiv = document.createElement('div');
        reportDiv.innerHTML = `
            <div style="background-color: ${bgColor}; padding: 40px; color: ${textColor}; font-family: sans-serif;">
                <h1 style="text-align: center; border-bottom: 2px solid ${textColor}; padding-bottom: 10px;">Medical Triage Report</h1>
                <p>Date: ${dateStr}</p>
                <h3>Symptoms:</h3><ul>${userSymptomsList}</ul>
                <h3>Verdict:</h3><p><strong>${issue}</strong></p>
                <h3>Plan:</h3>${solutionsHTML}
            </div>
        `;

        const opt = { margin: 0.5, filename: 'Medora_Triage_Report.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        if (typeof html2pdf !== 'undefined') html2pdf().set(opt).from(reportDiv).save();
    }
});
