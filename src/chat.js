require("dotenv").config()

const path = require("path")

const express = require("express")
const app = express()
const http = require("http").Server(app)

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

const { OpenAIWrapper } = require("./openai")

const { UploadWrapper } = require("./upload")
const upload = new UploadWrapper()

const { SearchWrapper } = require("./search")
const search = new SearchWrapper()

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/chat", (req, res) => {
	let secret = req.body.secret
	let messages = req.body.messages

	let openaiii = new OpenAIWrapper(secret)
	openaiii.chat(res, messages)
})

app.post("/upload", upload.singleFile(), function (req, res, next) {
	let secret = req.body.secret

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
	upload.createFolderIfNotExists()
	console.log(`Server läuft auf *${process.env.PORT}`)
})