document.addEventListener('DOMContentLoaded', () => {
    const userPostsContainer = document.querySelector('.user-posts .container');
    const profileInfoContainer = document.querySelector('.profile-info .container');

    fetchUserProfileAndPosts();

    async function fetchUserProfileAndPosts() {
        try {
            const userId = await getCurrentUserId();
            if (!userId) {
                console.error("User ID not found.");
                showMessage("User not logged in.", "error");
                return;
            }

            const profileResponse = await fetch(`https://job-portal-backend-f1wq.onrender.com/api/user_profile/${userId}/`);
            if (!profileResponse.ok) {
                throw new Error(`HTTP error! status: ${profileResponse.status}`);
            }
            const profileData = await profileResponse.json();
            updateProfileInfo(profileData);

            const postsResponse = await fetch(`https://job-portal-backend-f1wq.onrender.com/api/job_posts/`);
            if (!postsResponse.ok) {
                throw new Error(`HTTP error! status: ${postsResponse.status}`);
            }
            const postsData = await postsResponse.json();

            // **Filter posts to show only the logged-in user's posts**
            const userPosts = postsData.filter(post => post.user === parseInt(userId));
            displayUserPosts(userPosts);

        } catch (error) {
            console.error("Error fetching data:", error);
            showMessage("Error fetching data. Please try again later.", "error");
        }
    }

    async function getCurrentUserId() {
        const userId = localStorage.getItem('userId');
        return userId || null; 
    }

    function updateProfileInfo(profileData) {
        profileInfoContainer.innerHTML = `
            <h2><i class="fa-solid fa-user-circle"></i> User Profile</h2>
            <p>Name: ${profileData.full_name || "N/A"}</p>
            <p>Email: ${profileData.email || "N/A"}</p>
            <p>Skills: ${profileData.tags || "N/A"}</p>
            <p>Education: ${profileData.education || "N/A"}</p>
            <p>Experience: ${profileData.experience || "N/A"}</p>
            <a href="update-profile.html" class="btn"><i class="fa-solid fa-edit"></i> Edit Profile</a>
        `;
    }

    function displayUserPosts(posts) {
        userPostsContainer.innerHTML = ''; 
        if (posts.length === 0) {
            userPostsContainer.innerHTML = "<p>No posts created yet.</p>";
            return;
        }

        posts.forEach(post => {
            const jobCard = document.createElement('div');
            jobCard.classList.add('job-card');
            jobCard.innerHTML = `
                <h3>${post.job_title}</h3>
                <p><i class="fa-solid fa-location-dot"></i> Location: ${post.location}</p>
                <p><i class="fa-solid fa-building"></i> Company: ${post.company_name}</p>
                <a href="edit.html?id=${post.id}" class="btn"><i class="fa-solid fa-edit"></i> Edit</a>
                <button class="btn delete-btn" data-post-id="${post.id}"><i class="fa-solid fa-trash"></i> Delete</button>
            `;
            userPostsContainer.appendChild(jobCard);

            const deleteButton = jobCard.querySelector('.delete-btn');
            deleteButton.addEventListener('click', handleDeletePost);
        });
    }

    async function handleDeletePost(event) {
        const button = event.target;
        const postId = button.dataset.postId;

        if (confirm("Are you sure you want to delete this post?")) {
            try {
                const response = await fetch(`https://job-portal-backend-f1wq.onrender.com/api/job_posts/${postId}/`, { 
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });

                if (response.status === 204) {
                    button.parentElement.remove();
                    showMessage("Post deleted successfully.", "success");
                } else {
                    const errorData = await response.json(); 
                    console.error("Error deleting post:", response.status, errorData);
                    showMessage(errorData.error || "Error deleting post. Please try again.", "error");
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                showMessage("An error occurred while deleting the post.", "error");
            }
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
