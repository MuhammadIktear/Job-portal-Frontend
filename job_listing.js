document.addEventListener('DOMContentLoaded', () => {
    const jobListingContainer = document.querySelector('.job-listing .container');
    const filterForm = document.querySelector('.filter-jobs .filters'); // Get the filter form

    fetchJobsAndRecommend();

    async function fetchJobsAndRecommend() {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error("User ID not found.");
                showMessage("User not logged in.", "error");
                return;
            }

            const recommendedJobs = await fetchRecommendedJobs(userId);
            displayJobs(recommendedJobs);

            // Add event listeners to filters *after* jobs are initially loaded
            filterForm.addEventListener('change', applyFilters); // Listen for changes on the form

        } catch (error) {
            console.error("Error fetching or recommending jobs:", error);
            showMessage("Error fetching jobs. Please try again later.", "error");
        }
    }

    async function fetchRecommendedJobs(userId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/suggest_jobs/`, {  // Your API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') // Add if your API needs it
                },
                body: JSON.stringify({ candidate_id: userId }) // Send user ID
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const jobs = await response.json();
            return jobs;

        } catch (error) {
            console.error("Error fetching recommended jobs:", error);
            showMessage("Error fetching recommended jobs. Please try again later.", "error");
            return []; // Return an empty array in case of error
        }
    }

    function displayJobs(jobs) {
        jobListingContainer.innerHTML = '<h2>Recommended job based on your expertise</h2>'; 

        if (jobs.length === 0) {
            jobListingContainer.innerHTML = "<p>No jobs found.</p>";
            return;
        }

        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.classList.add('job-card');
            jobCard.innerHTML = `
                <h3>${job.job_title}</h3>
                <p><i class="fa-solid fa-location-dot"></i> Location: ${job.location}</p>
                <p><i class="fa-solid fa-building"></i> Company: ${job.company_name}</p>
                <a href="post-details.html?id=${job.id}" class="btn"><i class="fa-solid fa-eye"></i> View Details</a>
            `;
            jobListingContainer.appendChild(jobCard);
        });
    }

    async function applyFilters() {
        const filters = {
            country: document.getElementById('country-filter').value,
            industry: document.getElementById('industry-filter').value,
            experience: document.getElementById('experience-filter').value,
            jobFunction: document.getElementById('job-function-filter').value,
            jobTitle: document.getElementById('job-title-filter').value,
        };

        try {
            const userId = localStorage.getItem('userId');
            const filteredJobs = await fetchFilteredJobs(userId, filters); // Fetch filtered jobs
            displayJobs(filteredJobs); // Display the filtered and recommended jobs

        } catch (error) {
            console.error("Error applying filters:", error);
            showMessage("Error applying filters. Please try again.", "error");
        }
    }

    async function fetchFilteredJobs(userId, filters) {
        let url = `http://127.0.0.1:8000/api/job_posts/?user=${userId}`; // Start with the base URL for user's jobs

        for (const key in filters) {
            if (filters[key]) {
                url += `&${key}=${filters[key]}`; // Add filter parameters to the URL
            }
        }
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }
            const jobs = await response.json();
            return jobs;

        } catch (error) {
            console.error("Error fetching filtered jobs:", error);
            showMessage("Error fetching filtered jobs. Please try again.", "error");
            return [];
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