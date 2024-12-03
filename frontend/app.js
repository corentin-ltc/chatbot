document.getElementById("submit-btn").addEventListener("click", async () => {
    const userInput = document.getElementById("question-input").value;
    const responseDiv = document.getElementById("response");

    // Display loading message while waiting for the backend response
    responseDiv.innerHTML = "Chargement...";

    try {
        // Send POST request to Flask backend
        const response = await fetch('http://127.0.0.1:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_input: userInput })
        });

        // Parse the response JSON
        const data = await response.json();

        // Display response from assistant
        if (data.response) {
            responseDiv.innerHTML = `<strong>Teddy:</strong> ${data.response}`;
        } else if (data.error) {
            responseDiv.innerHTML = `<strong>Erreur :</strong> ${data.error}`;
        }
    } catch (error) {
        // Handle any connection issues
        responseDiv.innerHTML = `<strong>Erreur de connexion :</strong> ${error.message}`;
    }
});
