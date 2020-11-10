async function handler(bot, msg, args){
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
  if (!bot.is_op(msg, server)) return

  let delegates = server.delegates

  let send_list = () => {
    let delegates_list = delegates.map(a => a.name).join(' | ') || `no delgates have been set for '${server.name}'`
    msg.reply(`op: ${delegates_list}`)
  }

  if (cmd == '!delegate' && usr_role) {
    let a = delegates.find(a => a.id == usr_role.id)
    if (a) {
      a.name = usr_role.name
    } else {
      delegates.push({id: usr_role.id, name: ur_name, type: ur_type})
    }
    let saved = await bot.save_server_perms(server)
    if (saved) msg.reply(`${ur_name} has been delgated limited control of the '${server.name}' Minecraft server`)
    send_list()
  } else if (cmd == '!undelegate' && ur_name) {
    let a = usr_role ? delegates.find(a => a.id == usr_role.id) : delegates.find(a => a.name == mention_arg)
    let i = delegates.indexOf(a)
    if (i !== -1){
      let username = usr_role ? ur_name : a.name // ur_name is the most 'current' name, while a.name is how we saved it when the user was added as op
      delegates.splice(i,1)
      let saved = await bot.save_server_perms(server)
      if (saved) msg.reply(`${username}'s POWER has been revoked!  ${username} had minimal control of the '${server.name}' Minecraft server, but now even that is gone.`)
    } else {

      msg.reply(`Could not find a delgate matching: '${ur_name}'.  Type the name exactly as it appears in the list or mention the user with @`)
    }
    send_list()
  } else if (cmd == '!delegates') {
    send_list()
  }
}

module.exports = {
  name: 'delegate',
  commands: ['!delegate', '!undelegate', '!delegates'],
  pattern: '^(COMMAND) +(\\w+) *(\\S+)?',
  syntax: `!delegate`,
  handler,
}
