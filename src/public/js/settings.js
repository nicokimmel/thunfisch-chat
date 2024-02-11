var defaultChatSettings = {
    "theme": "dark",
    "menu": true,
    "tab": 0,
    "model": "gpt-4-turbo-preview",
    "context": false,
    "secret": ""
}
var chatSettings = defaultChatSettings

function restoreSettings() {
    if (localStorage.getItem("settings")) {
        chatSettings = JSON.parse(localStorage.getItem("settings"))
    }
    setTheme(chatSettings.theme)
    showMenu(chatSettings.menu)
    setContext(chatSettings.context)
    setSecret(chatSettings.secret)
    setModel(chatSettings.model)
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(chatSettings))
}

function toggleMenu() {
    showMenu(!chatSettings.menu)
}

function setTheme(theme) {
    chatSettings.theme = theme
    saveSettings()

    document.documentElement.setAttribute("data-bs-theme", chatSettings.theme)
    if (theme === "dark") {
        document.getElementById("chat-theme").innerHTML = `<i class="bi bi-sun-fill"></i>`
    } else {
        document.getElementById("chat-theme").innerHTML = `<i class="bi bi-moon-fill"></i>`
    }
}

function toggleTheme() {
    if (chatSettings.theme === "dark") {
        setTheme("light")
    } else {
        setTheme("dark")
    }
}

function showMenu(shown) {
    let menu = document.getElementById("chat-left")
    if (shown) {
        menu.classList.remove("d-none")
        chatSettings.menu = true
    } else {
        menu.classList.add("d-none")
        chatSettings.menu = false
    }
    saveSettings()
}

function setContext(enabled) {
    chatSettings.context = enabled
    saveSettings()

    document.getElementById("chat-context").checked = enabled
}

function setSecret(secret) {
    chatSettings.secret = secret
    document.getElementById("secret").value = secret
    saveSettings()
}

function setModel(model) {
    chatSettings.model = model
    document.getElementById("model-selection").value = model
    saveSettings()
}

restoreSettings()