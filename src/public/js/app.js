var defaultChatSettings = {
    "theme": "dark",
    "model": "GPT-4"
}
var chatSettings = defaultChatSettings

function restoreSettings() {
    if (localStorage.getItem("chatSettings")) {
        chatSettings = JSON.parse(localStorage.getItem("chatSettings"))
    }
    setTheme(chatSettings["theme"])
    setModel(chatSettings["model"])
}

function setTheme(theme) {
    chatSettings["theme"] = theme
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
    document.documentElement.setAttribute("data-bs-theme", chatSettings["theme"])
    if (theme === "dark") {
        document.getElementById("chat-theme").innerHTML = `<i class="bi bi-sun-fill"></i>`
    } else {
        document.getElementById("chat-theme").innerHTML = `<i class="bi bi-moon-fill"></i>`
    }
}

function toggleTheme() {
    if (chatSettings["theme"] === "dark") {
        setTheme("light")
    } else {
        setTheme("dark")
    }
}

function setModel(model) {
    chatSettings["model"] = model
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
    document.getElementById("promt-model").innerText = model
}

restoreSettings()