require("dotenv").config()

const express = require("express")
const path = require("path")
const app = express()
const http = require("http").Server(app)

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")))

const { Configuration, OpenAIApi } = require("openai")
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/api", (req, res) => {
	let model = req.body.model
	let promt = req.body.promt

	console.log(promt)
	
	switch (model) {
		case "GPT-4":
			res.status(200)
			res.send("Hallo, schön dass du da bist!")
			break
		case "GPT-3-Turbo":
			res.status(200)
			res.send("Hallo, wie geht es dir?")
			break
		case "DALL-E":
			res.status(200)
			res.send("Hallo, schön dich zu sehen.")
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