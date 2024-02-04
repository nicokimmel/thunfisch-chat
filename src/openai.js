const { OpenAI } = require("openai")

class OpenAIWrapper {

    constructor(secret) {
        this.openai = new OpenAI({
            apiKey: secret
            //organization: process.env.OPENAI_ORG_ID
        })
    }

    async chat(res, messages) {
        let self = this
        try {
            const stream = await this.openai.beta.chat.completions.runTools({
                stream: true,
                model: "gpt-4-turbo-preview",
                messages: messages,
                tools: [
                    {
                        type: "function",
                        function: {
                            function: async (prompt) => { return await self.image(prompt) },
                            description: "Create an image with the help of DALL-E.",
                            parameters: {
                                type: 'object',
                                properties: {
                                    prompt: {
                                        type: "string",
                                        description: "The prompt which DALL-E uses to generate the image."
                                    },
                                },
                            },
                        },
                    },
                ],
            })

            for await (const chunk of stream) {
                let delta = chunk.choices[0]?.delta

                console.log(delta)

                if (delta.content) {
                    res.write(chunk.choices[0]?.delta?.content)
                }

            }

            res.status(200)
            res.end()
        } catch (error) {
            res.write(`Die Anfrage konnte nicht verarbeitet werden.  
                \`${error.message}\``)
            res.end()
        }
    }

    async image(prompt) {
        try {
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                size: "1024x1024",
                quality: "standard",
                response_format: "url"
            })
            console.log("ANGEKOMMEN")
            console.log(response.data[0].url)
            return response.data[0].url
        } catch (error) {
            console.log("ERROR")
            console.log(error.message)
            return { success: false, reason: error.message }
        }
    }
}

module.exports = { OpenAIWrapper }