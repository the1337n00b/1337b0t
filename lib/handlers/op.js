function handler(bot, msg, args){
  if (!bot.is_owner(msg)) return

  let op_user_id = args[1]
}

module.exports = {
  disabled: true,
  name: 'op',
  commands: ['!op'],
  pattern: '^COMMAND +<@!(\\w*)>',
  syntax: `!op`,
  handler,
}
