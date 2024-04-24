var attachedFiles = []
var attachedImages = []

function clearAttachments() {
    attachedFiles = []
    attachedImages = []
    document.getElementById("chat-file-list").innerHTML = ""
}

function removeAttachedFile(index) {
    attachedFiles.splice(index, 1)
    refreshAttachments()
}

function removeAttachedImage(index) {
    attachedImages.splice(index, 1)
    refreshAttachments()
}

function addAttachedFile(fileName, content) {
    attachedFiles.push({ name: fileName, content: content })
    refreshAttachments()
}

function addAttachedImage(imageName, content) {
    attachedImages.push({ name: imageName, content: content })
    refreshAttachments()
}

function refreshAttachments() {
    let fileList = document.getElementById("chat-file-list")
    fileList.innerHTML = ""

    attachedFiles.forEach((file, index) => {
        console.log(file.name)
        let fileElement = document.createElement("div")
        fileElement.classList.add("input-group", "input-group-sm")
        fileElement.innerHTML = `
        <button class="btn btn-secondary btn-sm" type="button" onclick="removeAttachedFile('${index}')"><i class="bi bi-x"></i></button>
        <span class="input-group-text">${file.name}</span>`
        fileList.appendChild(fileElement)
    })

    attachedImages.forEach((image, index) => {
        console.log(image.name)
        let fileElement = document.createElement("div")
        fileElement.classList.add("input-group", "input-group-sm")
        fileElement.innerHTML = `
        <button class="btn btn-secondary btn-sm" type="button" onclick="removeAttachedImage('${index}')"><i class="bi bi-x"></i></button>
        <span class="input-group-text">${image.name}</span>`
        fileList.appendChild(fileElement)
    })
}