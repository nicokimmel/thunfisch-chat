function prompt(model, messages, callback) {
    let api = new XMLHttpRequest()
    api.open("POST", "/api", true);
    api.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    api.send(JSON.stringify({ "model": model, "messages": messages }))

    api.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            callback(this.responseText)
        }
    }
}

function search(query, callback) {
    let api = new XMLHttpRequest()
    api.open("POST", "/search", true);
    api.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    api.send(JSON.stringify({ "query": query }))

    api.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            callback(this.responseText)
        }
    }
}