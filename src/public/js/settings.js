var defaultChatSettings = {
    "theme": "dark",
    "menu": true,
    "tab": 0,
    "context": {
        "enabled": true,
        "size": 25
    },
    "secret": ""
}
var chatSettings = defaultChatSettings

function restoreSettings() {
    if (localStorage.getItem("settings")) {
        chatSettings = JSON.parse(localStorage.getItem("settings"))
    }
    setTheme(chatSettings.theme)
    showMenu(chatSettings.menu)
    setContext(chatSettings.context.enabled, chatSettings.context.size)
    setSecret(chatSettings.secret)
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

function setContext(enabled, size) {
    chatSettings.context.enabled = enabled
    chatSettings.context.size = size
    saveSettings()

    document.getElementById("chat-context").checked = enabled
}

function setSecret(secret) {
    chatSettings.secret = secret
    document.getElementById("secret").value = secret
    saveSettings()
}

restoreSettings()