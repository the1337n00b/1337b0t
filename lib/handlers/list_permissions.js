function handler(bot, msg, args){
  if (!bot.is_admin(msg)) return

  // get list of all users with permissions (admin/op/delegates)
  // sort list by username a-z
}

module.exports = {
  disabled: true,
  name: 'list_permissions',
  commands: ['!list_permissions'],
  pattern: '^COMMAND\\b>',
  syntax: `!list_permissions`,
  handler,
}
