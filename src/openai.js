const { OpenAI } = require("openai")
const { Browser } = require("./browser")

class OpenAIWrapper {

    constructor(secret) {
        this.openai = new OpenAI({
            apiKey: secret
        })
    }

    async chat(res, model, messages) {
        let self = this
        try {
            if(model.startsWith("o1-")) {
                const completion = await this.openai.chat.completions.create({
                    model: model,
                    messages: messages
                })
                
                res.send(completion.choices[0].message.content)
            } else {
                const stream = await this.openai.beta.chat.completions.runTools({
                    stream: true,
                    model: model,
                    messages: messages,
                    tools: [
                        {
                            type: "function",
                            function: {
                                name: "image",
                                function: async function image(prompt) {
                                    return await self.image(prompt)
                                },
                                description: "Create an image with the help of DALL-E. Do not use it unless the user uses words like \"create image\" or \"DALL-E\".",
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
                        },
                        {
                            type: "function",
                            function: {
                                name: "browse",
                                function: async function browse(url) {
                                    let parameters = JSON.parse(url)
                                    let browser = new Browser("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.3")
                                    return await browser.browse(parameters.url)
                                },
                                description: "Browses the internet and returns the HTML content of the page. Do not use it unless the user uses words like \"browse\". You can also use it to google if the user uses the phrase \"google for me\".",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        url: {
                                            type: "string",
                                            description: "The url which should be browsed."
                                        }
                                    },
                                    required: ["url"]
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
    
                res.writeHead(200, {
                    "Content-Type": "text/plain",
                    "Transfer-Encoding": "chunked"
                })
    
                for await (const chunk of stream) {
                    let delta = chunk.choices[0]?.delta
                    if (delta.content) {
                        res.write(delta.content)
                    }
                }
                
                res.end()
            }

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

            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: parameters.prompt,
                size: parameters.size,
                quality: parameters.quality,
                response_format: "url"
            })
            
            return {
                success: true,
                system: "Format the image in Markdown and include it into your answer. The description of the image is is the prompt you used. Remind the user that the link will expire in 1 hour.",
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