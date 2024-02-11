function sendPrompt(prompt) {
    let tab = chatSettings.tab

    if (prompt === "") {
        return
    }

    clearTextarea()

    addFilesToPrompt()

    addUserMessage(prompt)
    chatHistory[tab].messages.push({ role: "user", content: prompt })

    if (chatHistory[tab].title === "Unbenannt") {
        chatCompletion(
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
    chatCompletion(context,
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
    assistantMessage.classList.add("message-assistant", "d-flex", "flex-row", "bg-dark-subtle", "p-3", "rounded")
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

function addFilesToPrompt() {
    if (Object.keys(attachedFiles).length > 0) {
        for (let filename in attachedFiles) {
            prompt += `\n\n${filename}:\n`
            prompt += `\`\`\`\n${attachedFiles[filename]}\`\`\``
        }
        clearAttachedFiles()
    }
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
    var tooltipTriggerList = document.querySelectorAll(`[data-bs-toggle="tooltip"]`)
    var tooltipList = [...tooltipTriggerList].map(tooltipTriggerElement => new bootstrap.Tooltip(tooltipTriggerElement))
}

function setupHighlight() {
    /*showdown.extension("codehighlight", function () {
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
                    var left = "<pre><code\\b[^>]*>",
                        right = "</code></pre>",
                        flags = "g",
                        replacement = function (wholeMatch, match, left, right) {
                            match = htmlunencode(match)
                            return left + hljs.highlightAuto(match).value + right
                        }
                    return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags)
                }
            }
        ]
    })*/

    showdown.extension("codehighlight", function () {
        function htmlunencode(text) {
            return (
                text
                    .replace(/&amp;/g, "&")
                    .replace(/</g, "<")
                    .replace(/>/g, ">")
            );
        }
        return [
            {
                type: "output",
                filter: function (text, converter, options) {
                    // Suche nach <code> Blöcken mit einer "language-*" Klasse
                    var left = "<pre><code\\b[^>]*class=\"[^\"]*language-([^\"]*)[^\"]*\">",
                        right = "</code></pre>",
                        flags = "g",
                        replacement = function (wholeMatch, match, left, right) {
                            var matchStart = wholeMatch.indexOf(match),
                                tagLeft = wholeMatch.substring(0, matchStart),
                                tagRight = wholeMatch.substring(matchStart + match.length),
                                languageClassMatchResult = tagLeft.match(/class=\"[^\"]*language-([^\"]*)[^\"]*\"/);

                            // Extrahiere die Klasse, die auf "language-" folgt, um die Sprache zu identifizieren
                            var language = languageClassMatchResult ? languageClassMatchResult[1] : "plaintext";

                            // Entschlüsselung der HTML-Entities im match
                            match = htmlunencode(match);

                            // Hervorhebung unter der Annahme der identifizierten Sprache
                            var highlighted = hljs.highlightAuto(match, [language]).value;

                            return left + highlighted + right;
                        };

                    // ersetze rekursiv und wende Highlighting nur auf die passenden <code> Blöcke an
                    return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags);
                }
            }
        ];
    })

}

function setupDropzone() {
    Dropzone.autoDiscover = false
    var dropzone = new Dropzone("#chat-input", {
        url: "/upload",
        paramName: "file",
        params: {
            secret: chatSettings.secret
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
    setContext(this.checked)
})

document.getElementById("model-selection").addEventListener("change", function (event) {
    setModel(this.value)
})

resizeTextarea()

setupHighlight()
setupDropzone()
setupTooltips()

const markdown = new showdown.Converter({ extensions: ["codehighlight"] })