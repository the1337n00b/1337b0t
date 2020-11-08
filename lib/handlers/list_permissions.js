function handler(bot, msg, args){
  // get list of all users with permissions (admin/op)
  // sort list by username a-z
}

module.exports = {
  name: 'list_permissions',
  commands: ['!list_permissions'],
  pattern: '^COMMAND\\b>',
  syntax: `!list_permissions`,
  handler,
}
