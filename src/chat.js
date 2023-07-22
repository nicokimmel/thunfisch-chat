require("dotenv").config()

const express = require("express")
const path = require("path")
const app = express()
const http = require("http").Server(app)

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

const { OpenAIWrapper } = require("./openai")
const openai = new OpenAIWrapper()

const { UploadWrapper } = require("./upload")
const upload = new UploadWrapper()

const { SearchWrapper } = require("./search")
const search = new SearchWrapper()

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/api", (req, res) => {
	let model = req.body.model
	let messages = req.body.messages

	switch (model) {
		case "gpt3":
			openai.gpt("gpt-3.5-turbo", messages, (response, reason) => {
				res.status(200)
				res.send(response)
			})
			break
		case "gpt4":
			//openai.gpt("gpt-4", promt, (response, reason) => {
			res.status(200)
			res.send("Coming soon.")
			//})
			break
		case "dalle":
			openai.dalle(messages, (response) => {
				res.status(200)
				res.send(response)
			})
			break
		default:
			res.status(400)
			res.send("Bad model request")
			break
	}
})

app.post("/upload", upload.singleFile(), function (req, res, next) {
	if (!req.file) {
		return res.status(400).json({ error: "Keine Datei hochgeladen!" })
	}

	upload.extractText(req.file.path, (text) => {
		res.status(200)
		res.send(text)
		upload.removeFile(req.file.path)
	})
})

app.post("/search", (req, res) => {
	let query = req.body.query
	search.google(query, (result) => {
		res.status(200)
		res.send(JSON.stringify(result))
	})
})

http.listen(process.env.PORT, () => {
	console.log(`Server läuft auf http://localhost:${process.env.PORT}`)
})