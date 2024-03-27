const { Anthropic } = require("@anthropic-ai/sdk")

class AnthropicWrapper {

    constructor(secret) {
        this.anthropic = new Anthropic({
            apiKey: secret
        })
    }

    async chat(res, model, messages) {
        try {
            const stream = this.anthropic.messages
                .stream({
                    model: model,
                    max_tokens: 1024,
                    messages: messages
                })
                .on("text", (text) => {
                    res.write(text)
                    res.flush()
                })
                .on("finalMessage", (message) => {
                    res.write(message.content[0].text)
                    res.status(200)
                    res.end()
                })
                .on("error", (error) => {
                    res.write(`Die Anfrage konnte nicht verarbeitet werden.  
                        \`${error.message}\``)
                    res.end()
                    console.log(error)
                })
        } catch (error) {
            res.write(`Die Anfrage konnte nicht verarbeitet werden.  
                \`${error.message}\``)
            res.end()
        }
    }
}

module.exports = { AnthropicWrapper }