const { Configuration, OpenAIApi } = require("openai")

class OpenAIWrapper {

    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
            organization: process.env.OPENAI_ORG_ID
        })
        this.openai = new OpenAIApi(configuration)
    }

    async gpt3(prompt, callback) {
        const response = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        })
        let reason = response.data.choices[0].finish_reason
        let message = response.data.choices[0].message
        callback(message, reason)
    }

    async gpt4(prompt, callback) {
        const response = await this.openai.createChatCompletion({
            model: "gpt-4.0",
            messages: [{ role: "user", content: prompt }]
        })
        let reason = response.data.choices[0].finish_reason
        let message = response.data.choices[0].message
        callback(message, reason)
    }

    async dalle(prompt, callback) {
        const response = await this.openai.createImage({
            prompt,
            n: 1,
            size: "256x256"
        })
        callback(response.data.data[0].url)
    }
}

module.exports = { OpenAIWrapper }