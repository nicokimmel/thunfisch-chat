const fs = require("fs")

class WhitelistWrapper {

    constructor() {
        this.whitelistFile = "./whitelist.json"
        this.whitelist = []
    }

    createFileIfNotExists() {
        if (!fs.existsSync(this.whitelistFile)) {
            fs.writeFileSync(this.whitelistFile, JSON.stringify([], null, 2))
        }
    }

    loadFile() {
        this.whitelist = JSON.parse(fs.readFileSync(this.whitelistFile, "utf8"))
    }
    
    isWhitelisted(secret) {
        return this.whitelist.includes(secret)
    }
}

module.exports = { WhitelistWrapper }