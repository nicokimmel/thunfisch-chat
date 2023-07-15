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
        const response = await this.openai.createChatCompletion({
            model: version,
            messages: messages
        })
        let reason = response.data.choices[0].finish_reason
        let message = response.data.choices[0].message.content
        callback(message, reason)
    }

    async dalle(messages, callback) {
        let prompt = messages[messages.length - 1]
        const response = await this.openai.createImage({
            prompt: prompt.content,
            n: 1,
            size: "256x256"
        })
        callback(response.data.data[0].url)
    }
}

module.exports = { OpenAIWrapper }