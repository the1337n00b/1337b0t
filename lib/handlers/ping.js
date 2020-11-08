function handler(bot, msg, args){
  msg.reply('pong')
}

module.exports = {
  name: 'ping',
  commands: ['!ping'],
  pattern: '^COMMAND\\b',
  syntax: `!ping`,
  handler,
}
