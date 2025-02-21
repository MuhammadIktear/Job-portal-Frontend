document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logout')
    const token = localStorage.getItem('access_token'); 
    
    if (!token) {
        window.location.href = 'login.html'; 
        return; 
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }

    async function handleLogout(event) {
        event.preventDefault();
    
        const refreshToken = localStorage.getItem('refresh_token');
        const accessToken = localStorage.getItem('access_token'); 
    
        if (!refreshToken || !accessToken) {
            console.error("Refresh token or access token not found.");
            localStorage.removeItem('access_token'); 
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
            return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
    
            if (response.status === 204) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                console.error("Logout failed:", errorData);
                showMessage(errorData.error || "Logout failed. Please try again.", "error");
            }
        } catch (error) {
            console.error("Logout error:", error);
            showMessage("An error occurred during logout.", "error");
        }
    }

    function showMessage(message, type) {
        const messageContainer = document.createElement('div');
        messageContainer.textContent = message;
        messageContainer.classList.add(type === 'error' ? 'error-message' : 'success-message');
        document.body.appendChild(messageContainer);
        setTimeout(() => messageContainer.remove(), 3000);
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
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