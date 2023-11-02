require("dotenv").config()

const path = require("path")

const express = require("express")
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

const { SecretsWrapper } = require("./secrets")
const secrets = new SecretsWrapper()

app.get("/:secret", (req, res) => {
	let secret = req.params.secret
	if (!secrets.isSecretValid(secret)) {
		res.status(401)
		res.send("Unauthorized")
		return
	}

	res.sendFile(path.join(__dirname, "public", "chat.html"))
})

app.post("/api", (req, res) => {
	let secret = req.body.secret
	if (!secrets.isSecretValid(secret)) {
		res.status(401)
		res.send("Unauthorized")
		return
	}

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
			openai.gpt("gpt-4", messages, (response, reason) => {
				res.status(200)
				res.send(response)
			})
			break
		case "dalle":
			openai.dalle(messages, (response) => {
				res.status(200)
				res.send(response)
			})
			break
		default:
			res.status(400)
			res.send("Bad model request.")
			break
	}
})

app.post("/upload", upload.singleFile(), function (req, res, next) {
	let secret = req.body.secret
	if (!secrets.isSecretValid(secret)) {
		res.status(401)
		res.send("Unauthorized")
		return
	}

	if (!req.file) {
		res.status(400)
		res.send("No file uploaded.")
		return
	}

	upload.extractText(req.file.path, (text) => {
		res.status(200)
		res.send(text)
		upload.removeFile(req.file.path)
	})
})

app.post("/search", (req, res) => {
	let secret = req.body.secret
	if (!secrets.isSecretValid(secret)) {
		res.status(401)
		res.send("Unauthorized")
		return
	}

	if (!req.body.query || req.body.query.length < 3) {
		res.status(400)
		res.send("Bad query request. Queries must be at least 3 characters long.")
	}

	let query = req.body.query
	search.google(query, (result) => {
		res.status(200)
		res.send(JSON.stringify(result))
	})
})

http.listen(process.env.PORT, () => {
	secrets.createFileIfNotExists()
	upload.createFolderIfNotExists()
	console.log(`Server läuft auf *${process.env.PORT}`)
})