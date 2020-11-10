async function handler(bot, msg, args){
  if (!bot.is_owner(msg)) return
  
  let cmd = args[1]
  let srv_name = args[2]
  let user_arg = args[3]

  let user_parse = (/<@!(\w+)>/gi).exec(user_arg) || []
  let user_id = user_parse[1]
  let user = user_id ? msg.mentions.users.get(user_id) : null

  let guild_id = msg.channel.guild.id
  let server_key = `${srv_name}_${guild_id}`
  let server = bot.servers[server_key]
  
  if (!server) return msg.reply(`unknown server: \`${srv_name}\`.  Check the spelling and try again.  Use \`!list_servers\` to see all configured servers.`)
  let ops = server.operators

  let send_list = () => {
    let ops_list = ops.map(a => a.name).join(' | ') || 'no users have been granted operator/console access'
    msg.reply(`op: ${ops_list}`)
  }

  if (cmd == '!op' && user) {
    let a = ops.find(a => a.id == user.id)
    if (a) {
      a.name = user.name
    } else {
      ops.push({id: user.id, name: user.username})
    }
    let saved = await bot.save_server_perms(server)
    if (saved) msg.reply(`${user.username} has full OP/CONSOLE access to the ${server.name} Minecraft server via \`!cmd ${server.name} mc commands go here\``)
    send_list()
  } else if (cmd == '!deop' && (user || user_arg)) {
    let a = user ? ops.find(a => a.id == user.id) : ops.find(a => a.name == user_arg)
    let i = ops.indexOf(a)
    if (i !== -1){
      let username = user ? user.username : a.name // user.username is the most 'current' name, while a.name is how we saved it when the user was added as op
      ops.splice(i,1)
      let saved = await bot.save_server_perms(server)
      if (saved) msg.reply(`${username}'s POWER has been revoked!  ${username} does NOT have OP/CONSOLE access to the ${server.name} Minecraft server.`)
    } else {
      msg.reply(`Could not find a user with OP access matching: '${user ? user.username : user_arg}'.  Type the name exactly as it appears in the list or mention the user with @`)
    }
    send_list()
  } else if (cmd == '!ops') {
    send_list()
  }
}

module.exports = {
  name: 'op',
  commands: ['!op', '!deop', '!ops'],
  pattern: '^(COMMAND) +(\\w+) *(\\S+)?',
  // pattern: '^COMMAND +(<@!(\\w*)>)?',
  syntax: `!op`,
  handler,
}
