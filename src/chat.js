require("dotenv").config()

const express = require("express")
const path = require("path")
const app = express()
const http = require("http").Server(app)

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")))

const { OpenAIWrapper } = require("./openai")
const openai = new OpenAIWrapper()

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/api", (req, res) => {
	let model = req.body.model
	let promt = req.body.promt

	switch (model) {
		case "GPT-4":
			openai.gpt4(promt, (message, reason) => {
				res.status(200)
				res.send(message["content"])
			})
			break
		case "GPT-3-Turbo":
			openai.gpt3(promt, (message, reason) => {
				res.status(200)
				res.send(message["content"])
			})
			break
		case "DALL-E":
			openai.dalle(promt, (url) => {
				res.status(200)
				res.send(`<img src="${url}">`)
			})
			break
		default:
			res.status(400)
			res.send("Bad model request")
			break
	}
})

http.listen(process.env.PORT, () => {
	console.log(`Server läuft auf http://localhost:${process.env.PORT}`)
})