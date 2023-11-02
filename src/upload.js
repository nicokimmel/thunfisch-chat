const multer = require("multer")
const path = require("path")
const anytext = require("any-text")
const fs = require("fs")

class UploadWrapper {

    constructor() {
        const storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, path.join(__dirname, "uploads"))
            },
            filename: function (req, file, callback) {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
                callback(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
            }
        })

        const fileFilter = function (req, file, callback) {
            callback(null, true)
            /*
            if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
                callback(null, true)
            } else {
                callback(new Error("Nur Bilder und PDFs sind erlaubt!"))
            }
            */
        }

        this.upload = multer({ storage: storage, fileFilter: fileFilter })
        this.uploadFolder = "./uploads"
    }

    singleFile() {
        return this.upload.single("file")
    }

    async extractText(file, callback) {
        anytext.getText(file).then(function (data) {
            callback(data)
        })
    }

    removeFile(file) {
        fs.unlinkSync(file)
    }

    createFolderIfNotExists() {
        if (!fs.existsSync(this.uploadFolder)) {
            fs.mkdirSync(this.uploadFolder)
        }
    }
}

module.exports = { UploadWrapper }