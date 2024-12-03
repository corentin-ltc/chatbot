// Store chat histories for each bot
const chatHistories = {};

document.getElementById("create-bot-btn").addEventListener("click", async () => {
    const botName = document.getElementById("bot-name").value;
    const customPrompt = document.getElementById("custom-prompt").value;

    if (!botName || !customPrompt) {
        alert("Please provide both a name and a prompt.");
        return;
    }

    try {
        const response = await fetch('http://46.202.168.20:5000/api/create-chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_name: botName, custom_prompt: customPrompt })
        });

        const data = await response.json();

        if (data.success) {
            alert("Chatbot created successfully!");
            loadBots();
            document.getElementById("bot-name").value = "";
            document.getElementById("custom-prompt").value = "";
            // Initialize chat history for new bot
            chatHistories[botName] = [];
        } else if (data.error) {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert(`Connection Error: ${error.message}`);
    }
});

// Function to add a message to the chat history
function addMessageToChat(message, isUser = false, botName) {
    const chatHistory = document.getElementById("chat-history");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    
    // Add bot name tag for bot messages
    if (!isUser) {
        const botTag = document.createElement("div");
        botTag.className = "bot-tag";
        botTag.textContent = botName;
        messageContent.appendChild(botTag);
    }
    
    const textContent = document.createElement("div");
    textContent.textContent = message;
    messageContent.appendChild(textContent);
    
    const messageTime = document.createElement("div");
    messageTime.className = "message-time";
    messageTime.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    chatHistory.appendChild(messageDiv);
    
    // Store message in chat history
    if (!chatHistories[botName]) {
        chatHistories[botName] = [];
    }
    chatHistories[botName].push({
        message,
        isUser,
        time: new Date().toLocaleTimeString()
    });
    
    // Scroll to the bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

document.getElementById("submit-btn").addEventListener("click", async () => {
    const userInput = document.getElementById("question-input").value;
    const selectedBot = document.getElementById("select-chatbot").value;
    const chatHistory = document.getElementById("chat-history");

    if (!selectedBot || !userInput) {
        alert("Please select a chatbot and enter your question.");
        return;
    }

    // Add user message to chat
    addMessageToChat(userInput, true, selectedBot);
    
    // Clear input
    document.getElementById("question-input").value = "";

    try {
        const response = await fetch('http://46.202.168.20:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_name: selectedBot, user_input: userInput })
        });

        const data = await response.json();

        if (data.response) {
            // Add bot response to chat
            addMessageToChat(data.response, false, selectedBot);
        } else if (data.error) {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert(`Connection Error: ${error.message}`);
    }
});

// Load the list of chatbots
async function loadBots() {
    try {
        const response = await fetch('http://46.202.168.20:5000/api/get-bots');
        const data = await response.json();

        if (data.bots) {
            const botList = document.getElementById("bots");
            const selectBot = document.getElementById("select-chatbot");

            // Clear previous list
            botList.innerHTML = "";
            selectBot.innerHTML = '<option value="" disabled selected>Sélectionne un chatbot</option>';

            // Populate bot list
            data.bots.forEach(bot => {
                const listItem = document.createElement("li");
                listItem.textContent = bot.name;
                botList.appendChild(listItem);

                const option = document.createElement("option");
                option.value = bot.name;
                option.textContent = bot.name;
                selectBot.appendChild(option);
            });
        }
    } catch (error) {
        alert(`Connection Error: ${error.message}`);
    }
}

// Handle bot selection change
document.getElementById("select-chatbot").addEventListener("change", (e) => {
    const selectedBot = e.target.value;
    const chatHistory = document.getElementById("chat-history");
    
    // Clear current chat display
    chatHistory.innerHTML = "";
    
    // Load selected bot's chat history
    if (chatHistories[selectedBot]) {
        chatHistories[selectedBot].forEach(msg => {
            addMessageToChat(msg.message, msg.isUser, selectedBot);
        });
    }
});

// Add enter key support for sending messages
document.getElementById("question-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("submit-btn").click();
    }
});

// Initial loading of chatbots
loadBots();
