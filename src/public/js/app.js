var defaultChatSettings = {
    "theme": "dark",
    "model": "gpt4"
}

var chatSettings = defaultChatSettings
if(localStorage.getItem("chatSettings")) {
    var chatSettings = JSON.parse(localStorage.getItem("chatSettings"))
}

function setTheme(theme) {
    chatSettings["theme"] = theme
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
}

function setModel(model) {
    chatSettings["model"] = model
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
}