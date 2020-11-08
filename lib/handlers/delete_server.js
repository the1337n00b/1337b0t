function handler(bot, msg, args){
  msg.reply('pong')
}

module.exports = {
  name: 'delete_server',
  commands: ['!delete_server'],
  pattern: '^COMMAND +(\\w*)',
  syntax: `!delete_server {server_name}`,
  handler,
}
