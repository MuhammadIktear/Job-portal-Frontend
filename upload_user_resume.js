document.addEventListener('DOMContentLoaded', () => {
    const resumeUpload = document.getElementById('resume-upload');
    const uploadButton = document.getElementById('upload-button');
    const skillsTextarea = document.getElementById('skills');
    const saveSkillsButton = document.getElementById('save-skills-button');

    // 1. Retrieve and display skills on page load
    getAndDisplaySkills();

    if (uploadButton) {
        uploadButton.addEventListener('click', uploadResume);
    } else {
        console.error("Upload button not found!");
    }

    if (saveSkillsButton) {
        saveSkillsButton.addEventListener('click', saveSkills);
    } else {
        console.error("Save skills button not found!");
    }

    async function getAndDisplaySkills() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/user_profile/${userId}/`);
            if (response.ok) {
                const data = await response.json();
                if (data.tags) {
                    skillsTextarea.value = data.tags;
                }
            } else {
                console.error("Error fetching user profile:", await response.json());
            }

        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }

    async function uploadResume() {
        const userId = localStorage.getItem('userId');
        if (!resumeUpload) {
            console.error("Resume upload element not found!");
            return;
        }

        const file = resumeUpload.files[0];

        if (!file) {
            showMessage("Please select a resume file.", "error");
            return;
        }

        uploadButton.disabled = true;
        uploadButton.textContent = "Adding...";

        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('id', userId);

            const response = await fetch('http://127.0.0.1:8000/api/extract_tags/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Tags extracted successfully:", data);
                showMessage("Resume uploaded and tags extracted.", "success");

                if (data.tags && Array.isArray(data.tags)) {
                    skillsTextarea.value = data.tags.join(', ');
                } else if (data.tags) {
                    skillsTextarea.value = data.tags;
                } else {
                    skillsTextarea.value = "";
                }

            } else {
                const errorData = await response.json();
                console.error("Error extracting tags:", errorData);
                showMessage(errorData.error || "Error extracting tags. Please try again.", "error");
            }

        } catch (error) {
            console.error("Error uploading resume:", error);
            showMessage("An error occurred while uploading the resume. Please try again.", "error");
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = "Upload & Extract Tags";
        }
    }

    async function saveSkills() {
        const skills = skillsTextarea.value;
        const userId = localStorage.getItem('userId');

        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/user_profile/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tags: skills })
            });

            if (response.ok) {
                showMessage("Skills updated successfully.", "success");
            } else {
                const errorData = await response.json();
                console.error("Error updating skills:", errorData);
                showMessage(errorData.error || "Error updating skills. Please try again.", "error");
            }

        } catch (error) {
            console.error("Error updating skills:", error);
            showMessage("An error occurred while updating skills. Please try again.", "error");
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