var chatHistory = []

function restoreHistory() {
    if (localStorage.getItem("history")) {
        chatHistory = JSON.parse(localStorage.getItem("history"))
    } else {
        newChat()
    }
}

function restoreTabList() {
    let historyList = document.getElementById("tab-list")
    historyList.innerHTML = ""

    chatHistory.forEach((chat, index) => {
        let historyItem = document.createElement("ul")
        historyItem.classList.add("list-group", "list-group-horizontal")
        historyItem.innerHTML = `
            <li class="list-group-item list-group-item-action ${chatSettings.tab === index ? "active" : ""}"
                onclick="loadHistory(${index})">${chat.title}</li>
            <li class="list-group-item list-group-item-action list-group-item-delete ${chatSettings.tab === index ? "active" : ""}"
                onclick="removeChat(${index})"><i class="bi bi-trash-fill"></i></li>`
        historyList.appendChild(historyItem)
    })
}

function saveHistory() {
    localStorage.setItem("history", JSON.stringify(chatHistory))
}

function loadHistory(index) {
    if (index < 0 || index >= chatHistory.length) {
        return
    }

    let messageList = document.getElementById("message-list")
    messageList.innerHTML = ""

    let messages = chatHistory[index].messages
    messages.forEach(message => {
        if (message.role === "user") {
            addUserMessage(message.content)
        } else if (message.role === "assistant") {
            let assistantElement = addAssistantMessage()
            setAssistantMessage(assistantElement, message.content)
        } else if (message.role === "system") {
            let filenames = getFilenamesFromMessage(message.content)
            addSystemMessage(filenames)
        }
    })
    
    chatSettings.tab = index
    saveSettings()
    restoreTabList()
    window.setTimeout(scrollMessageList, 500)
}

function removeChat(index) {
    if (index < 0 || index >= chatHistory.length) {
        return
    }

    chatHistory.splice(index, 1)
    saveHistory()

    if (chatSettings.tab >= chatHistory.length) {
        chatSettings.tab = chatHistory.length - 1
    }
    if (chatSettings.tab < 0) {
        newChat()
        return
    }

    saveSettings()
    loadHistory(chatSettings.tab)
    restoreTabList()
}

function newChat() {
    let index = chatHistory.length
    chatHistory.push({
        title: "Unbenannt",
        messages: []
    })
    chatSettings.tab = index
    saveSettings()
    saveHistory()
    loadHistory(index)
}

function getContext() {
    let count = chatSettings.context ? chatHistory[chatSettings.tab].messages.length : 1
    return chatHistory[chatSettings.tab].messages.slice(-count)
}

function getFilenamesFromMessage(message) {
    const regex = /^Datei (\S+):$/gm
    let filenames = "\`\`\`Anhang"
    let match
    while ((match = regex.exec(message)) !== null) {
        filenames += `\n${match[1]}`
    }
    filenames += "\n\`\`\`\n\n"
    return filenames.trim()
}

restoreHistory()
loadHistory(chatSettings.tab)
restoreTabList()