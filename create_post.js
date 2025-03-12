document.addEventListener('DOMContentLoaded', () => {
    const jobCreateForm = document.getElementById('job-create-form');

    if (jobCreateForm) {
        jobCreateForm.addEventListener('submit', createJobPost);
    } else {
        console.error("Job create form not found!");
    }

    async function createJobPost(event) {
        event.preventDefault();

        const data = {
            job_title: document.getElementById('job-title').value,
            company_name: document.getElementById('company').value,
            country: document.getElementById('country').value,
            industry: document.getElementById('industry').value,
            job_function: document.getElementById('job-function').value,
            experience_level: document.getElementById('experience-level').value,
            location: document.getElementById('location').value,
            details: document.getElementById('details').value,
            user: localStorage.getItem('userId') 
        };

        console.log("Data being sent:", data); 

        try {
            const response = await fetch('https://job-portal-backend-f1wq.onrender.com/api/job_posts/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showMessage("Job post created successfully.", "success");
                jobCreateForm.reset(); 
            } else {
                const errorData = await response.json();
                console.error("Error creating job post:", errorData);
                showMessage(errorData.error || "Error creating job post. Please try again.", "error");
            }

        } catch (error) {
            console.error("Error creating job post:", error);
            showMessage("An error occurred while creating the job post. Please try again.", "error");
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