const fs = require('fs')
let files = fs.readdirSync(__dirname + '/handlers')
let commands = files.filter(f=>f.match(/\.js$/)).map(f=>require(`./handlers/${f}`))
let enabled_commands = commands.filter(c=>!c.disabled)

module.exports = enabled_commands
