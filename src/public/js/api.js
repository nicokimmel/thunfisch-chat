function chatCompletion(model, messages, onStream, onComplete) {
    let request = new XMLHttpRequest()

    request.open("POST", "/chat", true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    request.send(JSON.stringify({
        "secret": chatSettings.secret,
        "model": model,
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