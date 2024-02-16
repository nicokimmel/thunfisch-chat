var attachedFiles = {}

function clearAttachedFiles() {
    attachedFiles = {}
    document.getElementById("chat-file-list").innerHTML = ""
}

function removeAttachedFile(filename) {
    delete attachedFiles[filename]
    refreshAttachedFiles()
}

function addAttachedFile(filename, content) {
    attachedFiles[filename] = content
    refreshAttachedFiles()
}

function refreshAttachedFiles() {
    let fileList = document.getElementById("chat-file-list")
    fileList.innerHTML = ""

    for (let filename in attachedFiles) {
        console.log(filename)
        let fileItem = document.createElement("div")
        fileItem.classList.add("input-group", "input-group-sm")
        fileItem.innerHTML = `
        <button class="btn btn-secondary btn-sm" type="button" onclick="removeAttachedFile('${filename}')"><i class="bi bi-x"></i></button>
        <span class="input-group-text">${filename}</span>`
        fileList.appendChild(fileItem)
    }
}