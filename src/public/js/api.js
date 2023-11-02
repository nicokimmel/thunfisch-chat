function getSecretFromURL() {
    let url = window.location.href
    let parts = url.split("/")
    let secret = parts[parts.length - 1]
    return secret
}

console.log(getSecretFromURL())

function apiPrompt(model, messages, callback) {
    let api = new XMLHttpRequest()
    api.open("POST", "/api", true);
    api.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    api.send(JSON.stringify({ "secret": getSecretFromURL(), "model": model, "messages": messages }))

    api.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            callback(this.responseText)
        }
    }
}

function apiSearch(query, callback) {
    let api = new XMLHttpRequest()
    api.open("POST", "/search", true);
    api.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    api.send(JSON.stringify({ "secret": getSecretFromURL(), "query": query }))

    api.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            callback(this.responseText)
        }
    }
}