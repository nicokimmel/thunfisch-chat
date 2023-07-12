var defaultChatSettings = {
    "theme": "dark",
    "model": "GPT-4"
}
var chatSettings = defaultChatSettings

function restoreSettings() {
    if (localStorage.getItem("chatSettings")) {
        chatSettings = JSON.parse(localStorage.getItem("chatSettings"))
    }
    document.getElementById("promt-model").innerText = chatSettings["model"]
}

function setTheme(theme) {
    chatSettings["theme"] = theme
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
}

function setModel(model) {
    chatSettings["model"] = model
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
    document.getElementById("promt-model").innerText = model
}

restoreSettings()