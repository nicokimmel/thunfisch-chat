const axios = require("axios")
const { JSDOM } = require("jsdom")

class Browser {

    constructor(userAgent) {
        this.userAgent = userAgent

    }

    async browse(url) {
        let response = await axios.get(
            url,
            {
                headers: {
                    "User-Agent": this.userAgent,
                }
            }
        )

        let { document } = (new JSDOM(response.data)).window
        let text = this.extractText(document, document.body)

        return text
    }

    extractText(document, element) {
        let text = ""

        for (const child of element.childNodes) {
            if (child.nodeType === document.TEXT_NODE) {
                text += child.nodeValue
            } else if (child.nodeType === document.ELEMENT_NODE) {
                const tagName = child.tagName.toLowerCase()
                if (["script", "style"].includes(tagName)) {
                    continue
                }
                if (tagName === "br") {
                    text += "\n"
                } else if (["p", "div", "tr", "li", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
                    text += this.extractText(document, child) + "\n"
                } else {
                    text += this.extractText(document, child)
                }
            }
        }

        return text
            .replace(/\s+/g, " ")
            .replace(/\n +/g, "\n")
            .replace(/\n+/g, "\n")
            .trim()
    }
}

module.exports = { Browser }