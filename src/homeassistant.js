const axios = require("axios")
const fs = require("fs")

class HomeAssistantWrapper {

    constructor(url, token) {
        this.url = url
        this.token = token
        this.deviceList = []
    }

    async set(deviceId, state) {
        if (state !== "on" && state !== "off") {
            return "Error! State must be either \"on\" or \"off\"."
        }

        let entityType = deviceId.split(".")[0]

        let response = await axios.post(
            `${this.url}/api/services/${entityType}/turn_${state}`,
            {
                "entity_id": deviceId
            },
            {
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "content-type": "application/json"
                }
            }
        )

        let responseText = `${response.status} ${response.statusText}`
        return responseText
    }

    async get(deviceId) {
        let response = await axios.get(
            `${this.url}/api/states/${deviceId}`,
            {
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "content-type": "application/json"
                }
            }
        )

        return response.data.state
    }

    async list() {
        let rawData = fs.readFileSync("devices.json")
        let deviceList = JSON.parse(rawData)
        this.deviceList = deviceList
        return JSON.stringify(deviceList)
    }
}

module.exports = { HomeAssistantWrapper }