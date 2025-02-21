document.addEventListener('DOMContentLoaded', () => {
    const updateProfileForm = document.getElementById('update-profile-form');
    const nameInput = document.getElementById('name');
    const educationInput = document.getElementById('education');
    const bioTextarea = document.getElementById('bio');
    const experienceTextarea = document.getElementById('experience');
    const nameError = document.getElementById('name-error');

    // Load user profile data on page load
    loadUserProfile();

    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', updateProfile);
    } else {
        console.error("Update profile form not found!");
    }

    async function loadUserProfile() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/user_profile/${userId}/`);
            if (response.ok) {
                const data = await response.json();
                nameInput.value = data.full_name || "";
                educationInput.value = data.education || "";
                bioTextarea.value = data.bio || "";
                experienceTextarea.value = data.experience || "";
            } else {
                console.error("Error fetching user profile:", await response.json());
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }

    async function updateProfile(event) {
        event.preventDefault(); // Prevent default form submission

        nameError.textContent = ""; // Clear any previous errors

        const name = nameInput.value;
        const education = educationInput.value;
        const bio = bioTextarea.value;
        const experience = experienceTextarea.value;
        const userId = localStorage.getItem('userId');

        if (!name) {
            nameError.textContent = "Full Name is required.";
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/user_profile/${userId}/`, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: name,
                    education: education,
                    bio: bio,
                    experience: experience
                })
            });

            if (response.ok) {
                showMessage("Profile updated successfully.", "success");
            } else {
                const errorData = await response.json();
                console.error("Error updating profile:", errorData);
                showMessage(errorData.error || "Error updating profile. Please try again.", "error");
            }

        } catch (error) {
            console.error("Error updating profile:", error);
            showMessage("An error occurred while updating the profile. Please try again.", "error");
        }
    }

    function showMessage(message, type) {
        const messageContainer = document.createElement('div');
        messageContainer.textContent = message;
        messageContainer.classList.add(type === 'error' ? 'error-message' : 'success-message');
        document.body.appendChild(messageContainer);
        setTimeout(() => messageContainer.remove(), 3000);
    }
});