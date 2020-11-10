async function handler(bot, msg, args){
  if (!bot.is_owner(msg)) return

  let cmd = args[1]
  let srv_name = args[2]
  let mention_arg = args[3]

  let mention_types = {'!': 'users', '&': 'roles'}
  let mention_parse = (/<@([!&])(\w+)>/gi).exec(mention_arg) || []
  let ur_type = mention_types[mention_parse[1]]
  let mention_id = mention_parse[2]
  let usr_role = mention_id ? msg.mentions[ur_type].get(mention_id) : null
  let ur_name = usr_role ? usr_role.username || usr_role.name : mention_arg

  let guild_id = msg.channel.guild.id
  let server_key = `${srv_name}_${guild_id}`
  let server = bot.servers[server_key]

  if (!server) return msg.reply(`unknown server: \`${srv_name}\`.  Check the spelling and try again.  Use \`!list_servers\` to see all configured servers.`)
  let author = bot.is_op(msg, server)

  let operators = server.operators

  let send_list = () => {
    let ops_list = operators.map(a => a.name).join(' | ') || 'no users have been granted operator/console access'
    msg.reply(`op: ${ops_list}`)
  }

  if (cmd == '!op' && usr_role) {
    let a = operators.find(a => a.id == usr_role.id)
    if (a) {
      a.name = usr_role.name
    } else {
      operators.push({id: usr_role.id, name: ur_name, type: ur_type})
    }
    let saved = await bot.save_server_perms(server)
    if (saved) msg.reply(`${ur_name} has full OP/CONSOLE access to the ${server.name} Minecraft server via \`!cmd ${server.name} mc commands go here\``)
    send_list()
  } else if (cmd == '!deop' && ur_name) {
    let a = usr_role ? operators.find(a => a.id == usr_role.id) : operators.find(a => a.name == mention_arg)
    let i = operators.indexOf(a)
    if (i !== -1){
      let username = usr_role ? ur_name : a.name // ur_name is the most 'current' name, while a.name is how we saved it when the user was added as op
      operators.splice(i,1)
      let saved = await bot.save_server_perms(server)
      if (saved) msg.reply(`${username}'s POWER has been revoked!  ${username} does NOT have OP/CONSOLE access to the ${server.name} Minecraft server.`)
    } else {
      msg.reply(`Could not find a user with OP access matching: '${ur_name}'.  Type the name exactly as it appears in the list or mention the user with @`)
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
  syntax: `!op`,
  handler,
}
