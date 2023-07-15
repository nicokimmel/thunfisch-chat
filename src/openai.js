const { Configuration, OpenAIApi } = require("openai")

class OpenAIWrapper {

    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
            organization: process.env.OPENAI_ORG_ID
        })
        this.openai = new OpenAIApi(configuration)
    }

    async gpt(version, messages, callback) {
        try {
            const response = await this.openai.createChatCompletion({
                model: version,
                messages: messages
            })
            let reason = response.data.choices[0].finish_reason
            let message = response.data.choices[0].message.content
            callback(message, reason)
        } catch (error) {
            callback(`Die Anfrage konnte nicht verarbeitet werden.  
                \`${error.response.data.error.message || error.message}\``)
        }
    }

    async dalle(messages, callback) {
        let prompt = messages[messages.length - 1]
        try {
            const response = await this.openai.createImage({
                prompt: prompt.content,
                n: 1,
                size: "256x256"
            })
            callback(`![${prompt.content}](${response.data.data[0].url})`)
        } catch (error) {
            callback(`Die Anfrage konnte nicht verarbeitet werden.  
                \`${error.response.data.error.message || error.message}\``)
        }

    }
}

module.exports = { OpenAIWrapper }