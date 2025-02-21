async function getAdvice() {
    const userId = localStorage.getItem('userId');
    const adviceDiv = document.getElementById('advice-section');
    adviceDiv.innerHTML = "<p>Loading advice...</p>";

    if (!userId) {
        adviceDiv.innerHTML = "<p>User ID not found. Please log in.</p>";
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/get_advice_from_tags/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ candidate_id: userId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error getting advice: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        adviceDiv.innerHTML = `<p>${data.advice || "No advice found."}</p>`;

    } catch (error) {
        console.error("Error getting advice:", error);
        adviceDiv.innerHTML = `<p>${error.message}</p>`;
    }
}
