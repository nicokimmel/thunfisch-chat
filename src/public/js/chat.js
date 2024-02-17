function sendPrompt(prompt) {
    let tab = chatSettings.tab

    if (prompt === "") {
        return
    }

    clearTextarea()

    if (Object.keys(attachedFiles).length > 0) {
        let message = "Dateiuploads:"
        for (let filename in attachedFiles) {
            message += `\n\nDatei ${filename}:\n`
            message += `\`\`\`\n${attachedFiles[filename]}\n\`\`\``
        }
        addSystemMessage(getFilenamesFromMessage(message))
        chatHistory[tab].messages.push({ role: "system", content: message })
        clearAttachedFiles()
    }

    addUserMessage(prompt)
    chatHistory[tab].messages.push({ role: "user", content: prompt })

    if (chatHistory[tab].title === "Unbenannt") {
        chatCompletion("gpt-3.5-turbo",
            [{
                role: "user",
                content: "Schreibe eine simple Zusammenfassung mit maximal 5 Wörtern für die unten stehende Anfrage. Antworte nur mit der Zusammenfassung und bearbeite nicht die Anfrage selbst.\n\n" + prompt
            }],
            (response) => {
                chatHistory[tab].title = response
                restoreTabList()
            },
            (finalResponse) => {
                chatHistory[tab].title = finalResponse
                restoreTabList()
            })
    }

    let assistantElement = addAssistantMessage()
    scrollMessageList()

    let context = getContext()
    chatCompletion(chatSettings.model, context,
        (response) => {
            setAssistantMessage(assistantElement, response)
            scrollMessageList()
        },
        (finalResponse) => {
            chatHistory[tab].messages.push({ role: "assistant", content: finalResponse })
            saveHistory()
            window.setTimeout(scrollMessageList, 1000)
        })
}

function addUserMessage(message) {
    let userMessage = document.createElement("div")
    userMessage.classList.add("message-user", "d-flex", "flex-row", "p-3")
    userMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-person-fill"></i>
        </div>
        <div class="message-right p-2">${message.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>`
    document.getElementById("message-list").appendChild(userMessage)
    return userMessage
}

function addAssistantMessage() {
    let assistantMessage = document.createElement("div")
    assistantMessage.classList.add("message-assistant", "d-flex", "flex-row", "p-3", "bg-dark-subtle", "rounded")
    assistantMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-cpu-fill"></i>
        </div>
        <div class="message-right p-2" markdown="1">
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`
    document.getElementById("message-list").appendChild(assistantMessage)
    return assistantMessage
}

function setAssistantMessage(messageElement, message) {
    messageElement.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-cpu-fill"></i>
        </div>
        <div class="message-right p-2" markdown="1">
            ${markdown.makeHtml(message)}
        </div>`
    prettifyPreBlocks(messageElement)
}

function addSystemMessage(message) {
    let systemMessage = document.createElement("div")
    systemMessage.classList.add("message-system", "d-flex", "flex-row", "p-3", "mt-3", "bg-body-secondary", "rounded")
    systemMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-cloud-fill"></i>
        </div>
        <div class="message-right p-2">${markdown.makeHtml(message)}</div>`
    document.getElementById("message-list").appendChild(systemMessage)
    prettifyPreBlocks(systemMessage)
    return systemMessage
}

function prettifyPreBlocks(messageElement) {
    var codeTags = messageElement.querySelectorAll("pre")
    codeTags.forEach((preTag) => {
        preTag.classList.add("modified", "d-flex", "flex-column")

        let codeBar = document.createElement("div")
        codeBar.classList.add("d-flex", "flex-row", "justify-content-between", "align-items-center", "bg-dark", "p-1")

        let languageText = preTag.querySelector("code")?.className.match(/language-(\w+)/)?.[1] || "text"
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
    textarea.style.overflowX = "hidden"
    textarea.style.overflowY = "auto"
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
    var tooltipTriggerList = document.querySelectorAll(`[data-bs-toggle="tooltip"]`)
    var tooltipList = [...tooltipTriggerList].map(tooltipTriggerElement => new bootstrap.Tooltip(tooltipTriggerElement))
}

function setupHighlight() {
    showdown.extension("codehighlight", function () {
        function htmlunencode(text) {
            return (
                text
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
            )
        }
        return [
            {
                type: "output",
                filter: function (text, converter, options) {
                    var left = "<pre><code\\b[^>]*class=\"[^\"]*language-([^\"]*)[^\"]*\">",
                        right = "</code></pre>",
                        flags = "g",
                        replacement = function (wholeMatch, match, left, right) {
                            var matchStart = wholeMatch.indexOf(match),
                                tagLeft = wholeMatch.substring(0, matchStart),
                                tagRight = wholeMatch.substring(matchStart + match.length),
                                languageClassMatchResult = tagLeft.match(/class=\"[^\"]*language-([^\"]*)[^\"]*\"/)
                            var language = languageClassMatchResult ? languageClassMatchResult[1] : "plaintext"
                            match = htmlunencode(match)
                            var highlighted = hljs.highlightAuto(match, [language]).value

                            return left + highlighted + right
                        }
                    return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags)
                }
            }
        ]
    })

}

document.getElementById("secret").addEventListener("keyup", function () {
    setSecret(this.value)
})

document.getElementById("chat-theme").addEventListener("click", () => {
    toggleTheme()
})

document.getElementById("chat-submit").addEventListener("click", () => {
    let prompt = document.getElementById("chat-input").value
    sendPrompt(prompt)
})

document.getElementById("chat-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        let prompt = document.getElementById("chat-input").value
        sendPrompt(prompt)
        return
    }
})

document.getElementById("chat-input").addEventListener("input", function (event) {
    resizeTextarea()
})

document.getElementById("chat-menu").addEventListener("click", function (event) {
    toggleMenu()
})

document.getElementById("tab-new").addEventListener("click", function (event) {
    newChat()
})

document.getElementById("chat-context").addEventListener("change", function (event) {
    setContext(this.checked)
})

document.getElementById("model-selection").addEventListener("change", function (event) {
    setModel(this.value)
})

document.getElementById("chat-file-upload").addEventListener("click", function () {
    document.getElementById("chat-file-upload-input").click()
})

document.getElementById("chat-file-upload-input").addEventListener("change", function (event) {
    var files = event.target.files

    for (let file of files) {
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf(".") + 1)
        switch (extension) {
            case "doc":
            case "docx":
            case "xls":
            case "xlsx":
            case "ppt":
            case "pptx":
            case "pdf":
            case "hwp":
                const docToText = new DocToText()
                docToText.extractToText(file, extension)
                    .then(function (text) {
                        console.log(text)
                        addAttachedFile(file.name, text)
                    }).catch(function (error) {
                        console.error(error)
                    })
                break
            case "txt":
            case "csv":
            case "json":
            case "yaml":
            case "xml":
            case "html":
            case "htm":
            case "md":
                const reader = new FileReader()
                reader.onload = function (event) {
                    console.log(event.target.result)
                    addAttachedFile(file.name, event.target.result)
                }
                reader.readAsText(file)
                break
            default:
                break
        }
    }
})

resizeTextarea()

setupHighlight()
setupTooltips()

const markdown = new showdown.Converter({ extensions: ["codehighlight"] })