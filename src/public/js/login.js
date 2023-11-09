document.getElementById("login").addEventListener("click", () => {
    let secret = document.getElementById("secret").value
    location.href = "/" + secret
})