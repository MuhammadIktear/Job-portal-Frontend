document.addEventListener('DOMContentLoaded', () => {
    const getAdviceBtn = document.getElementById('get-advice-btn');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    let isSending = false; 

    getAdviceBtn.addEventListener('click', () => {
        chatbotContainer.style.display = "flex";
        getAdviceBtn.style.display = "none";
    });

    closeChatbot.addEventListener('click', () => {
        chatbotContainer.style.display = "none";
        getAdviceBtn.style.display = "block";
    });

    sendMessageBtn.addEventListener('click', sendMessage); 

    async function sendMessage() {
        const userMessage = chatbotInput.value.trim();

        if (userMessage === "" || isSending) return;

        isSending = true;
        sendMessageBtn.disabled = true; 

        displayMessage(userMessage, 'user-message');
        displayMessage("processing...", 'bot-message'); 

        try {
            const response = await fetch('https://job-portal-backend-f1wq.onrender.com/chatbot/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') 
                },
                body: JSON.stringify({ 'message': userMessage })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => {});
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const botReply = data.message;
            removeLastBotMessage();
            displayMessage(botReply, 'bot-message');

        } catch (error) {
            console.error("Error:", error);
            removeLastBotMessage(); 
            displayMessage("An error occurred.", 'bot-message');

        } finally {
            isSending = false;
            sendMessageBtn.disabled = false;
            chatbotInput.value = ""; 
        }
    }


    function displayMessage(message, type) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chatbot-message', type);
        const messageWithoutBolding = message.replace(/\*\*/g, ""); 
        messageContainer.innerHTML = messageWithoutBolding.replace(/\n/g, "<br>");

        chatbotMessages.appendChild(messageContainer);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function removeLastBotMessage(){
        const lastBotMessage = chatbotMessages.querySelector('.bot-message:last-of-type');
        if (lastBotMessage) {
            chatbotMessages.removeChild(lastBotMessage);
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie!== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});