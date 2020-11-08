const fs = require('fs')
let files = fs.readdirSync(__dirname + '/handlers')
let commands = files.filter(f=>f.match(/\.js$/)).map(f=>require(`./handlers/${f}`))

module.exports = commands
