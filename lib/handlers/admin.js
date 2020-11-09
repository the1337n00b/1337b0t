async function handler(bot, msg, args){
  if (!bot.is_admin(msg)) return

  let cmd = args[1]
  let user_arg = args[2]
  let user_parse = (/<@!(\w+)>/gi).exec(user_arg) || []
  let user_id = user_parse[1]
  let user = user_id ? msg.mentions.users.get(user_id) : null

  let guild_id = msg.channel.guild.id
  let guild = bot.guilds[guild_id]
  let admins = guild.admins

  let send_list = () => {
    let admin_list = admins.map(a => a.name).join(' | ') || 'no admins have been set'
    msg.reply(`admins: ${admin_list}`)
  }

  if (cmd == 'add' && user) {
    let a = admins.find(a => a.id == user.id)
    if (a) {
      a.name = user.name
    } else {
      admins.push({id: user.id, name: user.username})
    }
    await bot.save_guild(guild)
    msg.reply(`${user.username} is an admin.  This means that ${user.username} can add/edit/remove Minecraft server settings via this bot.`)
    send_list()
  } else if (cmd == 'remove' && (user || user_arg)) {
    let a = user ? admins.find(a => a.id == user.id) : admins.find(a => a.name == user_arg)
    let i = admins.indexOf(a)
    if (i !== -1){
      let username = user ? user.username : a.name // user.username is the most 'current' name, while a.name is how we saved it when the user was added as admin
      admins.splice(i,1)
      await bot.save_guild(guild)
      msg.reply(`${username} was removed from admin.  This means that ${username} can only list server status.`)
    } else {
      msg.reply(`Could not locate an admin matching: '${user ? user.username : user_arg}'.  Type the name exactly as it appears in the list or mention the user with @`)
    }
    send_list()
  } else if (cmd == 'list') {
    send_list()
  }

}

module.exports = {
  name: 'admin',
  commands: ['!admin'],
  pattern: '^COMMAND +(\\w+) *(\\S+)?',
  syntax: `!admin`,
  handler,
}
