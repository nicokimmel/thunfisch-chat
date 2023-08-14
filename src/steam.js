const SteamStrategy = require("passport-steam").Strategy

class SteamWrapper {

    constructor(passport) {
        this.loadWhitelist()

        passport.serializeUser((user, done) => {
            done(null, user)
        })

        passport.deserializeUser((user, done) => {
            done(null, user)
        })

        let self = this
        passport.use(new SteamStrategy({
            returnURL: `http://localhost:${process.env.PORT}/auth/return`,
            realm: `http://localhost:${process.env.PORT}/`,
            apiKey: process.env.STEAM_API_KEY
        }, function (identifier, profile, done) {
            process.nextTick(function () {
                profile.identifier = identifier
                if (self.whitelist.includes(profile.id)) {
                    console.log(`Logged in as ${profile.displayName} (${profile.id})`)
                    return done(null, profile);
                } else {
                    console.log(`Not whitelisted: ${profile.displayName} (${profile.id})`)
                    return done(null, false, { message: "Not whitelisted" });
                }
            })
        }
        ))
    }

    loadWhitelist() {
        let users = process.env.WHITELIST
        this.whitelist = users.split(",")
    }
}

module.exports = { SteamWrapper }