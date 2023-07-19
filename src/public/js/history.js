var chatHistory = [[]]

function restoreChatHistory() {
    if (localStorage.getItem("chatHistory")) {
        chatHistory = JSON.parse(localStorage.getItem("chatHistory"))
    } else {
        newTab()
    }
}

function restoreTabList() {
    let historyList = document.getElementById("tab-list")
    historyList.innerHTML = ""

    chatHistory.forEach((chat, index) => {
        let historyItem = document.createElement("button")
        historyItem.classList.add("list-group-item", "list-group-item-action")
        historyItem.innerHTML = chat[0]?.content || "Unbenannt"
        historyItem.setAttribute("onclick", "loadChatHistory(" + index + ")")
        historyList.appendChild(historyItem)

        if (index === chatSettings.tab) {
            historyItem.classList.add("active")
        }
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
                    ${message.content}
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
                ${message.content}
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
    }, 500)
}

function newTab() {

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