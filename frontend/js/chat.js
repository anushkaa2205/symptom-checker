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

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const symptom = chip.getAttribute('data-symptom');
            chatInput.value = symptom;
            sendMessage();
        });
    });

    async function sendMessage(overrideText) {
        const text = overrideText || chatInput.value.trim();
        if (text === '') return;
        
        if (chatHero) {
            chatHero.style.display = 'none';
        }
        
        chatHistory.push({ sender: 'user', text: text });
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
                body: JSON.stringify({ message: text, history: chatHistory.slice(0, -1) }) // send history WITHOUT the latest user message because backend might append it or expect it separately (checking chatController...)
            });
            
            // Wait, chatController expects req.body.message AND req.body.history. 
            // It builds prompt from both. So history should NOT include the current message.
            // My previous sendMessage code sent `history: chatHistory` which was empty for the first message.
            // After push, it would include the current message. 

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Failed to get response');
            }

            const data = await response.json();
            
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
            
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
            const verdictIndex = text.indexOf('VERDICT|');
            if (verdictIndex !== -1) {
                const conversationalPart = text.substring(0, verdictIndex).trim();
                const verdictPart = text.substring(verdictIndex);
                
                // If there's conversational text before the verdict, append it first
                if (conversationalPart) {
                    const introDiv = document.createElement('div');
                    introDiv.className = 'message-intro';
                    introDiv.style.marginBottom = '12px';
                    introDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(conversationalPart) : conversationalPart;
                    contentDiv.appendChild(introDiv);
                }

                // Parse verdict string
                const parts = verdictPart.split('|');
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
                
                const verdictCard = document.createElement('div');
                verdictCard.className = 'verdict-card';
                verdictCard.innerHTML = `
                    <div class="verdict-header">
                        <span class="verdict-icon"></span>
                        <span class="verdict-title">Assessment Verdict</span>
                    </div>
                    <div class="verdict-section">
                        <strong>Identified Issue</strong> <span>${issue}</span>
                    </div>
                    <div class="verdict-section">
                        <strong>Action Plan</strong> <div>${solutionHTML}</div>
                    </div>
                    ${medicineHTML}
                `;
                contentDiv.appendChild(verdictCard);

                const downloadPdfBtn = document.createElement('button');
                downloadPdfBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Download Report';
                downloadPdfBtn.className = "btn-pdf"; 
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
                        const authRes = await fetch('/api/auth/me', { credentials: 'include' });

                        if (!authRes.ok) {
                            if (typeof showToast === 'function') {
                                showToast("Please login to download the report.", "warning");
                            }
                            
                            localStorage.setItem("pendingGuestChat", JSON.stringify({
                                history: chatHistory,
                                timestamp: Date.now()
                            }));
                            sessionStorage.setItem("pendingDownloadIntent", JSON.stringify({
                                issue, solutionItems, medicineItems, symptomItems
                            }));
                            localStorage.setItem("redirectUrl", "/chat");
                            
                            setTimeout(() => {
                                window.location.href = "/login";
                            }, 1500);
                            return;
                        }

                        triggerDownload(issue, solutionItems, medicineItems, symptomItems);

                    } catch (error) {
                        console.error("Auth check failed:", error);
                        if (typeof showToast === 'function') showToast("Something went wrong.", "error");
                    }
                });
                contentDiv.appendChild(downloadPdfBtn);
            } else {
                contentDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
            }
        }
 else {
            contentDiv.textContent = text;
            
            // Add Edit Button for User Messages
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-msg-btn';
            editBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
            editBtn.title = 'Edit message';
            editBtn.addEventListener('click', () => editMessage(messageDiv, text));
            messageDiv.appendChild(editBtn);
        }

        messageDiv.appendChild(contentDiv);

        if(chatContainer){
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    function triggerDownload(issue, solutionItems, medicineItems, symptomItems) {
        if (typeof generatePDFReport === 'function') {
            generatePDFReport(issue, solutionItems, medicineItems, symptomItems);
            if (typeof showToast === 'function') showToast("PDF downloaded successfully.", "success");
        }
    }

    function editMessage(msgDiv, oldText) {
        const index = Array.from(chatContainer.children).indexOf(msgDiv);
        // Find index in chatHistory (user messages are at even indices if it starts with user, but let's be careful)
        // Actually, we can just truncate chatHistory to the point before this message
        
        chatInput.value = oldText;
        chatInput.focus();
        
        // Remove this message and everything after it from DOM
        while (chatContainer.children.length > index) {
            chatContainer.lastChild.remove();
        }
        
        // Truncate chatHistory
        // Find the index of this message in chatHistory by matching text and sender
        const historyIndex = chatHistory.findIndex((m, i) => m.sender === 'user' && m.text === oldText);
        if (historyIndex !== -1) {
            chatHistory = chatHistory.slice(0, historyIndex);
        }
        
        if (chatHistory.length === 0 && chatHero) {
            chatHero.style.display = 'flex';
            chatContainer.appendChild(chatHero);
        }
    }

    async function saveCurrentChat() {
    try {
        await fetch('/api/chat/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                chatId: currentChatId,
                history: chatHistory
            })
        })
        .then(res => res.json())
        .then(data => {
            if (!currentChatId && data.chatId) {
                currentChatId = data.chatId;
                fetchRecentChats();
            }
        });
    } catch (err) {
        console.error("Failed to auto-save chat", err);
    }
}
    async function restoreGuestChatAfterLogin() {
    try {
        const authRes = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (!authRes.ok) return;

        const pendingChat = localStorage.getItem("pendingGuestChat");
        if (!pendingChat) return;

        const parsed = JSON.parse(pendingChat);

        const saveRes = await fetch('/api/chat/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ history: parsed.history })
        });

        if (saveRes.ok) {
            const savedData = await saveRes.json();
            localStorage.removeItem("pendingGuestChat");
            localStorage.removeItem("redirectUrl");
            
            // Restore UI
            currentChatId = savedData.chatId;
            chatHistory = parsed.history;
            if (chatHero) chatHero.style.display = 'none';
            if (chatContainer) {
                chatContainer.innerHTML = '';
                chatHistory.forEach(msg => appendMessage(msg.sender, msg.text));
            }

            // Check for pending download
            const pendingDownload = sessionStorage.getItem("pendingDownloadIntent");
            if (pendingDownload) {
                const { issue, solutionItems, medicineItems, symptomItems } = JSON.parse(pendingDownload);
                setTimeout(() => {
                    triggerDownload(issue, solutionItems, medicineItems, symptomItems);
                    sessionStorage.removeItem("pendingDownloadIntent");
                }, 1000);
            }
        }

    } catch (err) {
        console.error("Failed to restore guest chat:", err);
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
                        <button class="delete-chat-btn" title="Delete session">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    `;
                    
                    li.querySelector('.chat-info').addEventListener('click', () => loadChat(chat._id));
                    li.querySelector('.chat-icon').addEventListener('click', () => loadChat(chat._id));
                    
                    li.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteChatSession(chat._id, chat.title || 'Assessment', date);
                    });
                    
                    recentChatsList.appendChild(li);
                });
            }
        } catch (err) { console.error("Failed to fetch history", err); }
    }

    function showConfirm(title, date) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('deleteModalOverlay');
            const previewTitle = document.getElementById('deletePreviewTitle');
            const previewDate = document.getElementById('deletePreviewDate');
            const cancelBtn = document.getElementById('deleteModalCancel');
            const confirmBtn = document.getElementById('deleteModalConfirm');

            if (previewTitle) previewTitle.textContent = title || 'Assessment';
            if (previewDate) previewDate.textContent = date || '';

            overlay.classList.add('visible');

            function close(result) {
                overlay.classList.remove('visible');
                cancelBtn.removeEventListener('click', onCancel);
                confirmBtn.removeEventListener('click', onConfirm);
                overlay.removeEventListener('click', onOverlayClick);
                resolve(result);
            }

            function onCancel() { close(false); }
            function onConfirm() { close(true); }
            function onOverlayClick(e) {
                if (e.target === overlay) close(false);
            }

            cancelBtn.addEventListener('click', onCancel);
            confirmBtn.addEventListener('click', onConfirm);
            overlay.addEventListener('click', onOverlayClick);
        });
    }

    async function deleteChatSession(chatId, chatTitle, chatDate) {
        const confirmed = await showConfirm(chatTitle, chatDate);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/chat/${chatId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                if (typeof showToast === 'function') showToast("Chat deleted successfully", "success");
                if (currentChatId === chatId) {
                    newChatBtn.click();
                }
                fetchRecentChats();
            } else {
                if (typeof showToast === 'function') showToast("Failed to delete chat", "error");
            }
        } catch (err) {
            console.error(err);
            if (typeof showToast === 'function') showToast("An error occurred", "error");
        }
    }

    async function loadChat(chatId) {
        try {
            const response = await fetch(`/api/chat/${chatId}`);
            if (response.ok) {
                const chat = await response.json();
                currentChatId = chat._id;
                chatHistory = chat.messages || [];
                
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
    (async () => {
    await restoreGuestChatAfterLogin();
    fetchRecentChats();
})();
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('id');
    if (chatIdFromUrl) loadChat(chatIdFromUrl);

    function generatePDFReport(issue, solutionItems, medicineItems, symptomItems) {
        const dateStr = new Date().toLocaleString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let userSymptomsList = '';
        if (symptomItems && symptomItems.length > 0) {
            symptomItems.forEach(item => { userSymptomsList += `<li style="margin-bottom: 8px;">${item.trim()}</li>`; });
        } else {
            userSymptomsList = chatHistory.filter(msg => msg.sender === 'user').map(msg => `<li style="margin-bottom: 8px;">${msg.text}</li>`).join('');
            if (!userSymptomsList) userSymptomsList = '<li>No symptoms explicitly provided.</li>';
        }

        let solutionsHTML = '';
        if (solutionItems && solutionItems.length > 0) {
            solutionItems.forEach(item => { solutionsHTML += `<li style="margin-bottom: 8px;">${item.trim()}</li>`; });
        } else {
            solutionsHTML = '<li>No solutions recorded.</li>';
        }

        let medicinesSection = '';
        if (medicineItems && medicineItems.length > 0 && medicineItems[0] !== 'None') {
            let medList = '';
            medicineItems.forEach(item => { medList += `<li style="margin-bottom: 8px;">${item.trim()}</li>`; });
            medicinesSection = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #0ea5e9; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px;">Recommended Medicines / Treatments</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6; font-size: 14px;">
                        ${medList}
                    </ul>
                </div>
            `;
        }

       
        const urgencyColor = '#0ea5e9';
        const urgencyText = 'Assessment';

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
                        <p style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 600; line-height: 1.3;">${issue || 'Unknown'}</p>
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
                            ${solutionsHTML}
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
        if (typeof html2pdf !== 'undefined') html2pdf().set(opt).from(reportDiv).save();
    }
});
