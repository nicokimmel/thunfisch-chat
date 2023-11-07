var chatHistory = []

function restoreHistory() {
    if (localStorage.getItem("chatHistory")) {
        chatHistory = JSON.parse(localStorage.getItem("chatHistory"))
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
                onclick="loadHistory(${index})">${chat[0]?.content || "Unbenannt"}</li>
            <li class="list-group-item list-group-item-action list-group-item-delete ${chatSettings.tab === index ? "active" : ""}"
                onclick="removeChat(${index})"><i class="bi bi-trash-fill"></i></li>`
        historyList.appendChild(historyItem)
    })
}

function saveHistory() {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
}

function loadHistory(index) {
    if (index < 0 || index >= chatHistory.length) {
        return
    }

    let messageList = document.getElementById("message-list")
    messageList.innerHTML = ""

    let chat = chatHistory[index]
    chat.forEach(message => {
        if (message.role === "user") {
            addUserMessage(message.content)
        } else if (message.role === "assistant") {
            let assistantElement = addAssistantMessage()
            setAssistantMessage(assistantElement, message.content)
        }
    })
    
    chatSettings.tab = index
    saveSettings()
    restoreTabList()
    window.setTimeout(prettifyCodeBlocks, 500)
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
    chatHistory.push([])
    chatSettings.tab = index
    saveSettings()
    saveHistory()
    loadHistory(index)
}

function getContext() {
    let count = 1
    if (chatSettings.context.enabled) {
        count = chatSettings.context.size
    }
    return chatHistory[chatSettings.tab].slice(-count)
}

restoreHistory()
loadHistory(chatSettings.tab)
restoreTabList()