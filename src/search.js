const cheerio = require("cheerio")
const axios = require("axios")

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
]

class SearchWrapper {

    constructor() {

    }

    randomUserAgent() {
        return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
    }

    google(query, callback) {
        axios
            .get(
                `https://www.google.com/search?q=${encodeURI(query)}&hl=de&gl=de`, {
                headers: {
                    'User-Agent': this.randomUserAgent(),
                },
            })
            .then(function ({ data }) {
                let $ = cheerio.load(data)

                let searchResult = {
                    "highlight": "",
                    "info": "",
                    "news": [],
                    "links": []
                }

                // Highlighted Snippet
                $(".hgKElc").each((i, element) => {
                    searchResult.highlight = $(element).text()
                })

                // News
                $(".WlydOe").each((i, element) => {
                    searchResult.news.push({
                        "title": $(element).find(".n0jPhd").text(),
                        "author": $(element).find(".MgUUmf span").text(),
                        "time": $(element).find(".OSrXXb span").text()
                    })
                })

                // Links
                $(".kvH3mc").each((i, element) => {
                    searchResult.links.push({
                        "title": $(element).find("a h3").text(),
                        "link": $(element).find("a").attr("href"),
                        "snippet": $(element).find(".VwiC3b").text()
                    })
                })

                callback(searchResult)
                console.log(searchResult)
            })
    }
}

module.exports = { SearchWrapper }