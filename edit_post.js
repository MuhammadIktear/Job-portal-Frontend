document.addEventListener('DOMContentLoaded', () => {
    const jobEditForm = document.getElementById('edit-job-form');
    const jobId = new URLSearchParams(window.location.search).get("id"); // Get job ID from URL
    const countrySelect = document.getElementById('country');
    const industrySelect = document.getElementById('industry');
    const experienceLevelSelect = document.getElementById('experience-level');
    const jobFunctionSelect = document.getElementById('job-function');
    const jobTitleInput = document.getElementById('job-title');
    const companyInput = document.getElementById('company');
    const locationInput = document.getElementById('location');
    const detailsTextarea = document.getElementById('details');

    if (jobEditForm) {
        jobEditForm.addEventListener('submit', updateJobPost);
    } else {
        console.error("Job edit form not found!");
    }

    if (jobId) {
        loadJobData(jobId);
    } else {
        console.error("Job ID not found in URL.");
        showMessage("Job ID not found. Please try again.", "error");
    }

    async function loadJobData(jobId) {
        try {
            const response = await fetch(`https://job-portal-backend-f1wq.onrender.com/api/job_posts/${jobId}/`); // Correct URL
            if (response.ok) {
                const jobData = await response.json();
                populateForm(jobData); // Use a separate function
            } else {
                const errorData = await response.json(); // Parse error response
                console.error("Error loading job data:", response.status, errorData);
                showMessage(errorData.error || "Error loading job data. Please try again.", "error"); // Show specific error
            }
        } catch (error) {
            console.error("Error loading job data:", error);
            showMessage("An error occurred while loading job data.", "error");
        }
    }

    function populateForm(jobData) {
        countrySelect.value = jobData.country;
        industrySelect.value = jobData.industry;
        experienceLevelSelect.value = jobData.experience_level;
        jobFunctionSelect.value = jobData.job_function;
        jobTitleInput.value = jobData.job_title;
        companyInput.value = jobData.company_name;
        locationInput.value = jobData.location;
        detailsTextarea.value = jobData.details;
    }

    async function updateJobPost(event) {
        event.preventDefault();

        const data = {
            job_title: jobTitleInput.value,
            company_name: companyInput.value,
            country: countrySelect.value,
            industry: industrySelect.value,
            job_function: jobFunctionSelect.value,
            experience_level: experienceLevelSelect.value,
            location: locationInput.value,
            details: detailsTextarea.value,
            user: localStorage.getItem('userId') 
        };

        try {
            const response = await fetch(`https://job-portal-backend-f1wq.onrender.com/api/job_posts/${jobId}/`, { // Correct URL
                method: 'PUT', // Or PATCH
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showMessage("Job post updated successfully.", "success");
            } else {
                const errorData = await response.json(); // Parse error response
                console.error("Error updating job post:", response.status, errorData);
                showMessage(errorData.error || "Error updating job post. Please try again.", "error"); // Show specific error
            }

        } catch (error) {
            console.error("Error updating job post:", error);
            showMessage("An error occurred while updating the job post.", "error");
        }
    }

    function showMessage(message, type) {
        const messageContainer = document.createElement('div');
        messageContainer.textContent = message;
        messageContainer.classList.add(type === 'error'? 'error-message': 'success-message');
        document.body.appendChild(messageContainer);
        setTimeout(() => messageContainer.remove(), 3000);
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