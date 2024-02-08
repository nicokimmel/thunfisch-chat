function chatCompletion(messages, onStream, onComplete) {
    let request = new XMLHttpRequest()

    request.open("POST", "/chat", true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    request.send(JSON.stringify({
        "secret": document.getElementById("secret").value,
        "messages": messages
    }))

    request.onprogress = function () {
        onStream(request.responseText)
        console.log(request.responseText)
    }

    request.onload = function () {
        onComplete(request.responseText)
    }
}

function searchCompletion(query, onComplete) {
    let request = new XMLHttpRequest()

    request.open("POST", "/search", true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    request.send(JSON.stringify({
        "secret": document.getElementById("secret").value,
        "query": query
    }))

    request.onload = function () {
        onComplete(request.responseText)
    }
}