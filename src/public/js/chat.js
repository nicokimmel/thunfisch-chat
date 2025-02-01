function sendPrompt(prompt) {
    let tab = chatSettings.tab

    if (prompt === "") {
        return
    }

    prompt = prompt.trim()

    clearTextarea()

    if (attachedFiles.length > 0) {
        let systemMessage = "Dateiuploads:"
        attachedFiles.forEach((file) => {
            systemMessage += `\n\nDatei ${file.name}:\n`
            systemMessage += `\`\`\`\n${file.content}\n\`\`\``
        })
        addSystemMessage(getFilenamesFromMessage(systemMessage))
        chatHistory[tab].messages.push({ role: "system", content: [{ type: "text", text: systemMessage }] })
    }

    let userMessage = { role: "user", content: [] }

    if (attachedImages.length > 0) {
        let systemMessage = ""
        attachedImages.forEach((file) => {
            userMessage.content.push({ type: "image_url", image_url: { url: file.content } })
            systemMessage += `<img src="${file.content}" class="img-thumbnail thumbnail-adjust">`
        })
        addSystemMessage(`<div class="d-flex gap-2">${systemMessage}</div>`, true)
    }

    clearAttachments()

    addUserMessage(prompt)

    userMessage.content.push({ type: "text", text: prompt })
    chatHistory[tab].messages.push(userMessage)

    if (chatHistory[tab].title === "Unbenannt") {
        let model = chatSettings.secret.startsWith("sk-ant-") ? "claude-3-haiku-20240307" : "gpt-4o-mini-2024-07-18"
        chatCompletion(model,
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

    let context = getContext()
    chatCompletion(chatSettings.model, context,
        (response) => {
            setAssistantMessage(assistantElement, response)
        },
        (finalResponse) => {
            chatHistory[tab].messages.push({ role: "assistant", content: [{ type: "text", text: finalResponse }] })
            saveHistory()
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
    document.getElementById("message-list").prepend(userMessage)
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
    document.getElementById("message-list").prepend(assistantMessage)
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

function addSystemMessage(message, isHTML) {
    let messageText = message
    if (!isHTML) {
        messageText = markdown.makeHtml(message)
    }

    let systemMessage = document.createElement("div")
    systemMessage.classList.add("message-system", "d-flex", "flex-row", "p-3", "mt-3", "bg-body-secondary", "rounded")
    systemMessage.innerHTML = `
        <div class="message-left p-2 fs-3">
            <i class="bi bi-cloud-fill"></i>
        </div>
        <div class="message-right p-2">${messageText}</div>`
    document.getElementById("message-list").prepend(systemMessage)
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
        codeLanguage.classList.add("no-selection")
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

document.getElementById("chat-save").addEventListener("click", () => {
    let storage = {
        settings: chatSettings,
        history: chatHistory
    }
    let jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storage))
    let downloadElement = document.createElement("a")
    downloadElement.setAttribute("href", jsonString)
    downloadElement.setAttribute("download", "chatStorage.json")
    downloadElement.click()
    downloadElement.remove()
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

document.getElementById("chat-input").addEventListener("paste", function (event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items
    for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile()
            if (blob) {
                event.preventDefault()
                const fileName = "image_" + new Date().getTime() + ".png"
                const reader = new FileReader()
                reader.onload = function (event) {
                    const content = event.target.result
                    addAttachedImage(fileName, content)
                }
                reader.readAsDataURL(blob)
                return
            }
        }
    }
})

document.getElementById("chat-input").addEventListener("drop", function (event) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        event.preventDefault()
        Array.from(files).forEach((file) => {
            grabFileContent(file)
        })
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
        grabFileContent(file)
    }
})

function grabFileContent(file) {
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
            const fileReader = new FileReader()
            fileReader.onload = (event) => {
                console.log(event.target.result)
                addAttachedFile(file.name, event.target.result)
            }
            fileReader.readAsText(file)
            break
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            const imageReader = new FileReader()
            imageReader.onload = (event) => {
                addAttachedImage(file.name, event.target.result)
            }
            imageReader.readAsDataURL(file)
            break
        default:
            break
    }
}

resizeTextarea()

setupHighlight()
setupTooltips()

const markdown = new showdown.Converter({ extensions: ["codehighlight"] })