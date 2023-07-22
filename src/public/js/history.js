var chatHistory = [[]]

function restoreChatHistory() {
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
                onclick="loadChatHistory(${index})">${chat[0]?.content || "Unbenannt"}</li>
            <li class="list-group-item list-group-item-action list-group-item-delete ${chatSettings.tab === index ? "active" : ""}"
                onclick="removeChat(${index})"><i class="bi bi-trash-fill"></i></li>`
        historyList.appendChild(historyItem)
    })
}

function saveChatHistory() {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
}

function loadChatHistory(index) {
    if (index < 0 || index >= chatHistory.length) {
        return
    }

    let messageList = document.getElementById("message-list")
    messageList.innerHTML = ""

    let chat = chatHistory[index]
    chat.forEach(message => {

        if (message.role === "user") {

            let userMessage = document.createElement("div")
            userMessage.classList.add("message-user", "d-flex", "flex-row", "p-3")
            userMessage.innerHTML = `
                <div class="message-left p-2 fs-3">
                    <i class="bi bi-person-fill"></i>
                </div>
                <md-block class="message-right p-2" markdown="1">
                    ${convertHtmlToText(message.content)}
                </md-block>`
            messageList.appendChild(userMessage)

        } else if (message.role === "assistant") {

            let assistantMessage = document.createElement("div")
            assistantMessage.classList.add("message-assistant", "d-flex", "flex-row", "bg-dark-subtle", "p-3", "rounded")
            assistantMessage.innerHTML = `
            <div class="message-left p-2 fs-3">
                <i class="bi bi-cpu-fill"></i>
            </div>
            <md-block class="message-right p-2" markdown="1">
                ${convertHtmlToText(message.content)}
            </md-block>`
            messageList.appendChild(assistantMessage)
        }
    })

    chatSettings.tab = index
    saveSettings()
    restoreTabList()

    setTimeout(() => {
        modifyCodeBlocks()
        scrollMessageList()
    }, 100)
}

function removeChat(index) {
    if (index < 0 || index >= chatHistory.length) {
        return
    }

    chatHistory.splice(index, 1)
    saveChatHistory()

    if (chatSettings.tab >= chatHistory.length) {
        chatSettings.tab = chatHistory.length - 1
    }
    if (chatSettings.tab < 0) {
        newChat()
        return
    }

    saveSettings()
    loadChatHistory(chatSettings.tab)
    restoreTabList()
}

function newChat() {

    let index = chatHistory.length

    chatHistory.push([])

    chatSettings.tab = index
    saveSettings()
    saveChatHistory()

    loadChatHistory(index)
}

function getHistory() {
    let count = 1
    if (chatSettings.context.enabled) {
        count = chatSettings.context.size
    }
    return chatHistory[chatSettings.tab].slice(-count)
}

restoreChatHistory()
loadChatHistory(chatSettings.tab)
restoreTabList()