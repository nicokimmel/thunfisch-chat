require("dotenv").config()

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
const { AnthropicWrapper } = require("./anthropic")

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

	if (secret.startsWith("sk-ant-")) {
		let anthropic = new AnthropicWrapper(secret)
		anthropic.chat(res, model, messages)
	} else {
		let openai = new OpenAIWrapper(secret)
		openai.chat(res, model, messages)
	}
})

http.listen(process.env.PORT, () => {
	console.log(`Server läuft auf *${process.env.PORT}`)

	testMessages = [
		{
			role: "user",
			content: [
				{ type: "text", text: "What’s in this image?" },
				{
					type: "image_url",
					image_url: {
						"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
					},
				},
			],
		},
	]
})