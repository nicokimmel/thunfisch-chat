require("dotenv").config()

const path = require("path")

const express = require("express")
const app = express()
const http = require("http").Server(app)

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

const CLIENT_DEPENDENCIES = ["bootstrap", "bootstrap-icons", "showdown", "highlightjs", "dropzone"]
CLIENT_DEPENDENCIES.forEach((lib) => {
	app.use(`/${lib}`, express.static(path.join(__dirname, `../node_modules/${lib}`)))
})

const { OpenAIWrapper } = require("./openai")

const { WhitelistWrapper } = require("./whitelist")
const whitelist = new WhitelistWrapper()

const { UploadWrapper } = require("./upload")
const upload = new UploadWrapper()

const { SearchWrapper } = require("./search")
const search = new SearchWrapper()

app.get("/favicon.ico", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "img", "tuna_chat.ico"))
})

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/chat", (req, res) => {
	let secret = req.body.secret
	let messages = req.body.messages
	
	let openai = new OpenAIWrapper(secret)
	openai.chat(res, messages)
})

app.post("/upload", upload.singleFile(), function (req, res, next) {
	let secret = req.body.secret

	if (!whitelist.isWhitelisted(secret)) {
		res.status(403)
		res.send(`Die Anfrage konnte nicht verarbeitet werden.  
		\`You are not whitelisted.\``)
		return
	}

	res.status(501)
	res.send("Not implemented yet.")
	return

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

	if (!whitelist.isWhitelisted(secret)) {
		res.status(403)
		res.send(`Die Anfrage konnte nicht verarbeitet werden.  
		\`You are not whitelisted.\``)
		return
	}
	
	res.status(501)
	res.send("Not implemented yet.")
	return

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
	whitelist.createFileIfNotExists()
	whitelist.loadFile()
	console.log(`Server läuft auf *${process.env.PORT}`)
})