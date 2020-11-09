async function handler(bot, msg, args){
  if (!bot.is_admin(msg)) return

  let guild_id = msg.channel.guild.id
  let name = args[1]

  if (name){
    let srv = bot.servers[`${name}_${guild_id}`]
    if (!(srv && srv.id)) return // only continue if there's a server with this name

    let sql_result = await bot.set_default_server(srv.id)
    let is_default = sql_result.def
    msg.reply(`${srv.name} [${srv.title}] ${srv.host} has ${is_default ? '' : 'NOT'} been successfully set as default`)
  } else {
    let srv = await bot.get_default_server(guild_id)
    if (srv) {
      msg.reply(`${srv.name} [${srv.title}] ${srv.host} is the default Minecraft server.`)
    } else {
      msg.reply(`A default server has not been specified for this Discord server.`)
    }
  }
}

module.exports = {
  name: 'default_server',
  commands: ['!default_server', '!default'],
  pattern: '^COMMAND *(\\w*)?',
  syntax: `!default_server {server_name}`,
  handler,
}
