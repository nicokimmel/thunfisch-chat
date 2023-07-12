function sendPrompt() {
    let model = chatSettings["model"]
    let prompt = document.getElementById("promt-text").value
    document.getElementById("promt-text").value = ""
    resizePromtTextarea()

    if (prompt == "") {
        return
    }

    let userMessage = document.createElement("div")
    userMessage.classList.add("message-box", "row", "mb-3", "me-3", "border", "rounded", "bg-body-secondary")
    userMessage.innerHTML = `
        <div class="message-image col-1 fs-3 text-center align-self-center">
            <i class="bi bi-person-fill"></i>
        </div>
        <div class="message-text col-11 p-3 border-start text-wrap">
            ${prompt.replace(/\n/g, "<br>")}
        </div>`
    document.getElementById("message-list").appendChild(userMessage)
    scrollMessageList()

    let responseMessage = document.createElement("div")
    responseMessage.classList.add("message-box", "row", "mb-3", "ms-3", "border", "rounded", "bg-body-secondary")
    responseMessage.innerHTML = `
        <div class="message-image col-1 fs-3 text-center align-self-center">
            <i class="bi bi-cpu-fill"></i>
        </div>
        <md-block class="message-text col-11 p-3 border-start" markdown="1">
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

    callAPI(model, prompt, (response) => {
        responseMessage.innerHTML = `
            <div class="message-image col-1 fs-3 text-center align-self-center">
                <i class="bi bi-cpu-fill"></i>
            </div>
            <md-block class="message-text col-11 p-3 border-start text-wrap" markdown="1">
                ${response}
            </md-block>`
        scrollMessageList()
    })
}

function resizePromtTextarea() {
    let textarea = document.getElementById("promt-text")
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

document.getElementById("chat-theme").addEventListener("click", () => {
    toggleTheme()
})

document.getElementById("promt-model-gpt4").addEventListener("click", () => {
    setModel("GPT-4")
})

document.getElementById("promt-model-gpt3").addEventListener("click", () => {
    setModel("GPT-3-Turbo")
})

document.getElementById("promt-model-dalle").addEventListener("click", () => {
    setModel("DALL-E")
})

document.getElementById("promt-send").addEventListener("click", () => {
    sendPrompt()
})

document.getElementById("promt-text").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        sendPrompt()
        return
    }
})

document.getElementById("promt-text").addEventListener("keyup", function (event) {
    resizePromtTextarea()
})

resizePromtTextarea()