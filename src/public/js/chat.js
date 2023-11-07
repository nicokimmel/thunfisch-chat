function sendPrompt() {
    let model = chatSettings["model"]
    let prompt = document.getElementById("chat-input").value
    let tab = chatSettings.tab

    clearTextarea()

    if (prompt === "") {
        return
    }

    if (isGoogleSearch(model)) {
        return
    }

    addFilesToPrompt()

    addUserMessage(prompt)
    chatHistory[tab].push({ role: "user", content: prompt })
    prettifyCodeBlocks()

    restoreTabList()

    let assistantElement = addAssistantMessage()
    scrollMessageList()

    let context = getContext()
    chatCompletion(model, context,
        (response) => {
            setAssistantMessage(assistantElement, response)
            scrollMessageList()
        },
        (finalResponse) => {
            chatHistory[tab].push({ role: "assistant", content: finalResponse })
            saveHistory()
            prettifyCodeBlocks()
            scrollMessageList()
        })
}

function isGoogleSearch(model) {
    if (model === "google") {
        // TODO Google Search
        return true
    }
    return false
}

function addUserMessage(message) {
    let userMessage = document.createElement("div")
    userMessage.classList.add("message-user", "d-flex", "flex-row", "p-3")
    userMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-person-fill"></i>
        </div>
        <md-block class="message-right p-2" markdown="1">
            ${convertHtmlToText(message).replaceAll("\n", "  \n")}
        </md-block>`
    document.getElementById("message-list").appendChild(userMessage)
    return userMessage
}

function addAssistantMessage() {
    let assistantMessage = document.createElement("div")
    assistantMessage.classList.add("message-assistant", "d-flex", "flex-row", "bg-dark-subtle", "p-3", "rounded")
    assistantMessage.innerHTML = `
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
    document.getElementById("message-list").appendChild(assistantMessage)
    return assistantMessage
}

function setAssistantMessage(messageElement, message) {
    messageElement.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-cpu-fill"></i>
        </div>
        <md-block class="message-right p-2" markdown="1">
            ${convertHtmlToText(message)}
        </md-block>`
}

function addFilesToPrompt() {
    if (Object.keys(attachedFiles).length > 0) {
        for (let filename in attachedFiles) {
            prompt += `\n\n${filename}:\n`
            prompt += `\`\`\`\n${attachedFiles[filename]}\`\`\``
        }
        clearAttachedFiles()
    }
}

function convertHtmlToText(html) {
    return html.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
        return "&#" + i.charCodeAt(0) + ";"
    })
}

function prettifyCodeBlocks() {
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
                    }, 1000)
                }, () => {
                    copyButton.classList.add("btn-danger")
                    setTimeout(() => {
                        copyButton.classList.remove("btn-danger")
                    }, 1000)
                })
        })

        codeBar.appendChild(copyButton)

        preTag.prepend(codeBar)
    })
}

function clearTextarea() {
    document.getElementById("chat-input").value = ""
    resizeTextarea()
}

function resizeTextarea() {
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

function setupTooltips() {
    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    var tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

function setupDropzone() {
    Dropzone.autoDiscover = false
    var dropzone = new Dropzone("#chat-input", {
        url: "/upload",
        paramName: "file",
        params: {
            secret: getSecretFromURL()
        },
        clickable: false,
        previewsContainer: false,
        acceptedFiles: ".doc,.docx,.dot,.pdf,.csv,.txt,.xls,.xlsx",
        maxFilesize: 5,
        dictDefaultMessage: "Datei hier ablegen",
        init: function () {
            this.on("success", function (file, content) {
                addAttachedFile(file.name, content)
            })
        }
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
    resizeTextarea()
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

resizeTextarea()

setupDropzone()
setupTooltips()