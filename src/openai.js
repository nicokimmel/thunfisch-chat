const { OpenAI } = require("openai")

class OpenAIWrapper {

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            organization: process.env.OPENAI_ORG_ID
        })
    }

    async gpt(res, version, messages) {
        try {
            const stream = await this.openai.beta.chat.completions.stream({
                model: version,
                messages: messages,
                stream: true
            })
            for await (const chunk of stream) {
                res.write(chunk.choices[0]?.delta?.content || '')
            }
            res.status(200)
            res.end()
        } catch (error) {
            res.write(`Die Anfrage konnte nicht verarbeitet werden.  
                \`${error.message}\``)
            res.end()
        }
    }

    async dalle(res, version, messages) {
        let prompt = messages[messages.length - 1]
        try {
            const response = await this.openai.images.generate({
                model: version,
                prompt: prompt.content,
                size: "1024x1024",
                quality: "standard",
                response_format: "b64_json"
            })
            res.status(400)
            res.send(`![${prompt.content}](data:image/png;base64,${response.data[0].b64_json})`)
        } catch (error) {
            res.send(`Die Anfrage konnte nicht verarbeitet werden.  
                \`${error.message}\``)
        }

    }
}

module.exports = { OpenAIWrapper }