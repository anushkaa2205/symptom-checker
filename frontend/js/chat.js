document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    let chatTurn = 0;
    if(themeToggleBtn){
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('theme-unique');
            if (document.body.classList.contains('theme-unique')) {
                themeToggleBtn.innerHTML = '✨ Switch to Familiar';
            } else {
                themeToggleBtn.innerHTML = '✨ Try Unique Style';
            }
        });
    }
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;
        appendMessage('user', text);
        chatInput.value = '';
        setTimeout(() => {
            if (chatTurn === 0) {
                appendMessage('bot', "I understand. Do you have any other associated symptoms like fever, chills, or nausea?");
                chatTurn++;
            } else if (chatTurn === 1) {
                appendMessage('bot', "Thank you for the additional details. Based on your symptoms, it seems to be a minor issue but could require medical attention if it persists. A full preliminary analysis has been generated for you.", true);
                chatTurn++;
            } else {
                appendMessage('bot', "You have already generated your report. Please review it on the dashboard or start a new chat session.");
            }
        }, 1200);
    }
    function appendMessage(sender, text, showButton = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        if (sender === 'bot') {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar bot-avatar';
            avatarDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
            messageDiv.appendChild(avatarDiv);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

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
});
