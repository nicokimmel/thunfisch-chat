const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")

class SearchWrapper {

    constructor() {
        let useragentsraw = fs.readFileSync("src/useragents.json", "utf-8")
        this.useragents = JSON.parse(useragentsraw)
    }

    randomUserAgent() {
        return this.useragents[Math.floor(Math.random() * this.useragents.length)].ua
    }

    randomProxy(callback) {
        axios
            .get("https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=100&country=all&ssl=all&anonymity=all",
                {
                    headers: {
                        "User-Agent": this.randomUserAgent(),
                    },
                })
            .then(function ({ data }) {
                const lines = data.trim().split("\n")
                const proxies = []
                lines.forEach((line) => {
                    const [ip, port] = line.split(":")
                    proxies.push({ ip: ip.trim(), port: parseInt(port.trim()) })
                })
                callback(proxies[Math.floor(Math.random() * proxies.length)])
            })
    }

    google(query, callback) {
        axios
            .get(
                `https://www.google.com/search?q=${encodeURI(query)}&hl=de&gl=de`,
                {
                    headers: {
                        "User-Agent": this.randomUserAgent(),
                    },
                    /*proxy: {
                        protocol: "http",
                        host: randomProxy.ip,
                        port: randomProxy.port
                    }*/
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
                
                // Info Block
                $(".yxjZuf").each((i, element) => {
                    searchResult.info = $(element).text()
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
                $(".MjjYud").each((i, element) => {
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