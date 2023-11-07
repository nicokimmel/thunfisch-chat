function getSecretFromURL() {
    let url = window.location.href
    let parts = url.split("/")
    let secret = parts[parts.length - 1]
    return secret
}

function chatCompletion(model, messages, onStream, onComplete) {
    let request = new XMLHttpRequest()

    request.open("POST", "/api", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    request.send(JSON.stringify({
        "secret": getSecretFromURL(),
        "model": model,
        "messages": messages
    }))

    request.onprogress = function () {
        onStream(request.responseText)
    }

    request.onload = function () {
        onComplete(request.responseText)
    }
}

function searchCompletion(query, onStream, onComplete) {
    let request = new XMLHttpRequest()

    request.open("POST", "/api", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    request.send(JSON.stringify({
        "secret": getSecretFromURL(),
        "query": query
    }))

    request.onprogress = function () {
        onStream(request.responseText)
    }

    request.onload = function () {
        onComplete(request.responseText)
    }
}