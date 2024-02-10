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
                            name: "image",
                            function: async function image(prompt) { return await self.image(prompt) },
                            description: "Create an image with the help of DALL-E.",
                            parameters: {
                                type: "object",
                                properties: {
                                    prompt: {
                                        type: "string",
                                        description: "The prompt which DALL-E uses to generate the image."
                                    },
                                    size: {
                                        type: "string",
                                        description: "The size of the generated images. Must be one of \"1024x1024\", \"1792x1024\", or \"1024x1792\". Defaults to \"1024x1024\". If the user refers to a widescreen or wallpaper image, the \"1792x1024\" size should be used."
                                    },
                                    quality: {
                                        type: "string",
                                        description: "The quality of the image that will be generated. Must be either \"standard\" or \"hd\". Defaults to \"standard\". Do not use \"hd\" unless the user says they want a high-resolution image."
                                    }
                                },
                                required: ["prompt"]
                            }
                        }
                    }
                ]
            })

            stream.on("error", (error) => {
                res.write(`Die Anfrage konnte nicht verarbeitet werden.  
                    \`${error.message}\``)
                res.end()
            })

            for await (const chunk of stream) {
                let delta = chunk.choices[0]?.delta
                if (delta.content) {
                    res.write(delta.content)
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

    async image(parameters) {
        try {
            parameters = JSON.parse(parameters)
            
            const validSizes = ["1792x1024", "1024x1792", "1024x1024"]
            if (!validSizes.includes(parameters.size)) {
                parameters.size = "1024x1024"
            }

            const validQualities = ["standard", "hd"]
            if (!validQualities.includes(parameters.quality)) {
                parameters.quality = "standard"
            }

            console.log(`prompt: ${parameters.prompt}, size: ${parameters.size}, quality: ${parameters.quality}`)

            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: parameters.prompt,
                size: parameters.size,
                quality: parameters.quality,
                response_format: "url"
            })
            
            return {
                success: true,
                system: "Format the URL in Markdown and include it into your answer. The prompt should be the alt text in brackets. Also remind the user that the link will expire in 1 hour.",
                url: response.data[0].url,
                prompt: parameters.prompt
            }
        } catch (error) {
            return {
                success: false,
                system: `An error happened. Please include this message into your answer: ${error.message}`
            }
        }
    }
}

module.exports = { OpenAIWrapper }