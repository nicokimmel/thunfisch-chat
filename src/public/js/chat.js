function sendPrompt() {
    let model = chatSettings["model"]
    let prompt = document.getElementById("chat-input").value
    let tab = chatSettings.tab

    if (Object.keys(attachedFiles).length > 0) {
        for (let filename in attachedFiles) {
            prompt += `\n\n${filename}:\n`
            prompt += `\`\`\`\n${attachedFiles[filename]}\`\`\``
        }
        clearAttachedFiles()
    }

    if (chatSettings.model === "google") {
        apiSearch(prompt, (result) => {
            setModel("gpt3")
            document.getElementById("chat-input").value += "\n\nGoogle Suchergebnisse in JSON formatiert:\n\`\`\`JSON\n" + result + "\n\`\`\`\nBitte fasse die Suchergebnisse auf Deutsch zusammen."
            sendPrompt()
        })
        return
    }

    console.log(prompt)

    document.getElementById("chat-input").value = ""
    resizePromptTextarea()

    if (prompt == "") {
        return
    }

    let userMessage = document.createElement("div")
    userMessage.classList.add("message-user", "d-flex", "flex-row", "p-3")
    userMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-person-fill"></i>
        </div>
        <md-block class="message-right p-2" markdown="1">
            ${convertHtmlToText(prompt)}
        </md-block>`
    document.getElementById("message-list").appendChild(userMessage)
    modifyCodeBlocks()
    scrollMessageList()

    chatHistory[tab].push({ role: "user", content: prompt })
    restoreTabList()

    let responseMessage = document.createElement("div")
    responseMessage.classList.add("message-assistant", "d-flex", "flex-row", "bg-dark-subtle", "p-3", "rounded")
    responseMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-cpu-fill"></i>
        </div>
        <md-block class="message-right p-2" markdown="1">
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </md-block>`
    document.getElementById("message-list").appendChild(responseMessage)
    scrollMessageList()

    let messages = getHistory()
    apiPrompt(model, messages, (response) => {
        responseMessage.innerHTML = `
            <div class="message-left p-2 fs-3">
                <i class="bi bi-cpu-fill"></i>
            </div>
            <md-block class="message-right p-2" markdown="1">
                ${convertHtmlToText(response)}
            </md-block>`
        scrollMessageList()

        chatHistory[tab].push({ role: "assistant", content: response })
        setTimeout(modifyCodeBlocks, 100)
        saveChatHistory()
    })
}

function resizePromptTextarea() {
    let textarea = document.getElementById("chat-input")
    textarea.style.overflow = "hidden"
    textarea.style.height = 0
    if (textarea.scrollHeight < 200) {
        textarea.style.height = textarea.scrollHeight + "px"
    } else {
        textarea.style.height = "200px"
    }
}

function scrollMessageList() {
    let messageList = document.getElementById("message-list")
    messageList.scrollTo(0, messageList.scrollHeight)
}

function modifyCodeBlocks() {
    var preTags = document.querySelectorAll("pre")
    preTags.forEach((preTag) => {
        if (preTag.classList.contains("modified")) {
            return
        }

        preTag.classList.add("modified", "d-flex", "flex-column")

        let codeBar = document.createElement("div")
        codeBar.classList.add("d-flex", "flex-row", "justify-content-between", "align-items-center", "bg-dark", "p-1")

        let languageText = preTag.className.match(/language-(\w+)/)?.[1] || "text"
        let codeLanguage = document.createElement("span")
        codeLanguage.innerHTML = languageText.toUpperCase()

        codeBar.appendChild(codeLanguage)

        let copyButton = document.createElement("button")
        copyButton.innerHTML = `<i class="bi bi-clipboard"></i>`
        copyButton.classList.add("btn", "btn-sm", "btn-secondary", "copy-button")
        copyButton.style.setProperty("--bs-btn-padding-y", ".25rem")
        copyButton.style.setProperty("--bs-btn-padding-x", ".5rem")
        copyButton.style.setProperty("--bs-btn-font-size", ".75rem")
        copyButton.addEventListener("click", (event) => {
            let text = preTag.innerText.substring(preTag.innerText.indexOf("\n") + 1)
            navigator.clipboard.writeText(text)
                .then(() => {
                    copyButton.classList.add("btn-success")
                    setTimeout(() => {
                        copyButton.classList.remove("btn-success")
                    }, 2000)
                }, () => {
                    copyButton.classList.add("btn-danger")
                    setTimeout(() => {
                        copyButton.classList.remove("btn-danger")
                    }, 2000)
                })
        })

        codeBar.appendChild(copyButton)

        preTag.prepend(codeBar)
    })
}

function convertHtmlToText(html) {
    return html.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
        return "&#" + i.charCodeAt(0) + ";"
    })
}


document.getElementById("chat-theme").addEventListener("click", () => {
    toggleTheme()
})

document.getElementById("chat-model-gpt3").addEventListener("click", () => {
    setModel("gpt3")
})

document.getElementById("chat-model-gpt4").addEventListener("click", () => {
    setModel("gpt4")
})

document.getElementById("chat-model-dalle").addEventListener("click", () => {
    setModel("dalle")
})

document.getElementById("chat-model-google").addEventListener("click", () => {
    setModel("google")
})

document.getElementById("chat-submit").addEventListener("click", () => {
    sendPrompt()
})

document.getElementById("chat-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        sendPrompt()
        return
    }
})

document.getElementById("chat-input").addEventListener("keyup", function (event) {
    resizePromptTextarea()
})

document.getElementById("chat-menu").addEventListener("click", function (event) {
    toggleMenu()
})

document.getElementById("tab-new").addEventListener("click", function (event) {
    newChat()
})

document.getElementById("chat-context").addEventListener("change", function (event) {
    setContext(this.checked, chatSettings.context.size)
})

resizePromptTextarea()

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

Dropzone.autoDiscover = false
var dropzone = new Dropzone("#chat-input", {
    url: "/upload",
    paramName: "file",
    clickable: false,
    previewsContainer: false,
    acceptedFiles: ".doc,.docx,.dot,.pdf,.csv,.txt,.xls,.xlsx",
    maxFilesize: 5,
    dictDefaultMessage: "Datei hier ablegen",
    init: function () {
        this.on("success", function (file, content) {
            addAttachedFile(file.name, content)
            console.log(file.name)
            console.log(content)
        })
    }
})