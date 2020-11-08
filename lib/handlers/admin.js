function handler(bot, msg, args){
  let op_user_id = args[1]
}

module.exports = {
  name: 'admin',
  commands: ['!admin'],
  pattern: '^COMMAND +<@!(\\w*)>',
  syntax: `!admin`,
  handler,
}
