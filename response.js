const typingform = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const suggestions = document.querySelectorAll(".suggestion");
let userMessage = null;

const API_KEY = "AIzaSyCpRKPYzuv_QU9ORlV29wYE0smtDHoa63M";  
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Creating a new message element and returning it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Display words one by one
const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');
    let currentWordIndex = 0; 
    
    // Append each word to the text with a gap
    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];

        // If all words are displayed then clear the interval
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
        }
    }, 75);
}

const generateAPIResponse = async (incomingMessageDiv) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        console.log(data);
       
        const apiResponse = data?.candidates[0].content.parts[0].text;
        console.log(apiResponse);

        // Create a new message element for the API response
        const responseMessageDiv = createMessageElement(`
            <div class="message-content">
                <img src="gemini.svg" alt="Gemini Image" class="avatar">
                <p class="text"></p>
            </div>`, "incoming");

        // Replace the loading message with the response message
        chatList.replaceChild(responseMessageDiv, incomingMessageDiv);

        // Show typing effect
        const textElement = responseMessageDiv.querySelector(".text");
        showTypingEffect(apiResponse, textElement);

        // Save chat to local storage
        saveChat();

    } catch (error) {
        console.log(error);
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// Loading Animation for API response
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                <img src="gemini.svg" alt="Gemini Image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span class="icon material-symbols-rounded">content_copy</span>`;
    
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);
    generateAPIResponse(incomingMessageDiv); // Call the API response function here
}

// Copying message text to clipboard
const copyMessage  = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; // Tick Icon
    setTimeout(() => copyIcon.innerText = "content-copy", 1000); // Back to icon after 1 sec
}

// Handle outgoing chat
const handleOutgoingChat = (message) => {
    userMessage = message || typingform.querySelector(".typing-input").value.trim();
    if (!userMessage) return; // Exit if there is no message

    const html = `
        <div class="message-content">
            <img src="user.jpg" alt="User Image" class="avatar">
            <p class="text"></p>
        </div>`;
    
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingform.reset(); // Clear input
    setTimeout(showLoadingAnimation, 500); // Show loading animation

    // Save chat to local storage
    saveChat();
}

// Toggle theme and save preference
toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("light_mode");
    const isLightMode = document.body.classList.contains("light_mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
    toggleThemeButton.textContent = isLightMode ? "dark_mode" : "light_mode";
});

// Load theme from local storage
const loadTheme = () => {
    const theme = localStorage.getItem("theme");
    if (theme) {
        document.body.classList.toggle("light_mode", theme === "light");
        toggleThemeButton.textContent = theme === "light" ? "dark_mode" : "light_mode";
    }
}

// Save chat to local storage
const saveChat = () => {
    localStorage.setItem("savedChats", chatList.innerHTML);
}

// Load chat from local storage
const loadChat = () => {
    const savedChats = localStorage.getItem("savedChats");
    if (savedChats) {
        chatList.innerHTML = savedChats;
    }
}

// Delete all messages
deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        chatList.innerHTML = "";
    }
});

// Prevent default form submission
typingform.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

// Handle suggestion click
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        const suggestionText = suggestion.querySelector(".text").innerText;
        handleOutgoingChat(suggestionText);
    });
});

// Clear local storage and chat list on page load
const clearLocalStorage = () => {
    localStorage.removeItem("savedChats");
    chatList.innerHTML = "";
}

// Load theme and chat on page load
window.addEventListener("load", () => {
    clearLocalStorage();
    loadTheme();
});
