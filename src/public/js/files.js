var attachedFiles = []

function clearAttachedFiles() {
    attachedFiles = []
    document.getElementById("file-list").innerHTML = ""
}

function removeAttachedFile(index) {
    attachedFiles.splice(index, 1)
}

function addAttachedFile(filename, content) {
    attachedFiles.push({ filename: filename, content: content })
    
    let index = attachedFiles.length - 1
    
    let fileList = document.getElementById("file-list")
    let fileItem = document.createElement("div")
    fileItem.classList.add("input-group", "input-group-sm")
    fileItem.innerHTML = `
        <button class="btn btn-primary" type="button" onclick="removeAttachedFile(${index})"><i class="bi bi-x"></i></button>
        <span class="input-group-text">${filename}</span>`
    fileList.appendChild(fileItem)
}