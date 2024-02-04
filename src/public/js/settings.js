var defaultChatSettings = {
    "theme": "dark",
    "menu": true,
    "tab": 0,
    "context": {
        "enabled": true,
        "size": 10
    }
}
var chatSettings = defaultChatSettings

function restoreSettings() {
    if (localStorage.getItem("chatSettings")) {
        chatSettings = JSON.parse(localStorage.getItem("chatSettings"))
    }
    setTheme(chatSettings.theme)
    showMenu(chatSettings.menu)
    setContext(chatSettings.context.enabled, chatSettings.context.size)
}

function saveSettings() {
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
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

restoreSettings()