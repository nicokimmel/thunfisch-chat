const fs = require("fs")

class SecretsWrapper {

    constructor() {
        this.secretsFile = "./secrets.json"
    }

    createFileIfNotExists() {
        if (!fs.existsSync(this.secretsFile)) {
            fs.writeFileSync(this.secretsFile, JSON.stringify([], null, 2))
            console.log(`Die Datei ${this.secretsFile} wurde erstellt.`)
        }
    }

    isSecretValid(secret) {
        const secretsList = JSON.parse(fs.readFileSync(this.secretsFile, "utf8"))
        return secretsList.includes(secret)
    }
}

module.exports = { SecretsWrapper }