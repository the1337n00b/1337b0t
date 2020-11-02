const DiscordBot = require('./lib/dcbot.js')
const config = require('./config.js')
let bot = new DiscordBot(config)

module.exports = bot
