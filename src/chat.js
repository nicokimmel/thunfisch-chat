require("dotenv").config()

const PORT = process.env.PORT || 3000

const path = require("path")

const express = require("express")
const app = express()
const http = require("http").Server(app)

app.use(express.json({ limit: "50mb" }))
app.use(express.static(path.join(__dirname, "public")))

const CLIENT_DEPENDENCIES = ["bootstrap", "bootstrap-icons", "showdown", "highlightjs", "dropzone"]
CLIENT_DEPENDENCIES.forEach((lib) => {
	app.use(`/${lib}`, express.static(path.join(__dirname, `../node_modules/${lib}`)))
})

const { OpenAIWrapper } = require("./openai")

app.get("/favicon.ico", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "img", "tuna_chat.ico"))
})

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/chat", (req, res) => {
	let secret = req.body.secret
	let model = req.body.model
	let messages = req.body.messages

	let openai = new OpenAIWrapper(secret)
	openai.chat(res, model, messages)
})

http.listen(PORT, () => {
	console.log(`Server läuft auf *${PORT}`)
})
