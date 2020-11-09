async function handler(bot, msg, args){
  if (!bot.is_admin(msg)) return

  let guild_id = msg.channel.guild.id
  let servers = await bot.get_guild_servers(guild_id)
  // format the response to look nice
  let srv_arr = []
  for (let s of servers) {
    let srv = bot.servers[`${s.name}_${s.guild_id}`]
    let port_string = bot.is_admin(msg) || srv.port != 25565 ? ':' + srv.port : ''
    let rport_string = bot.is_admin(msg) && srv.rport ? ':' + srv.rport : ''
    let host_string = `${srv.host}${port_string}${rport_string}`
    srv_arr.push(`${srv.name} [${srv.title}] ${host_string} ${srv.def ? '(default)' : ''}`)
  }
  msg.reply(srv_arr.join("\n"))
}

module.exports = {
  name: 'list_servers',
  commands: ['!list_servers', '!list'],
  pattern: '^COMMAND\\b',
  syntax: `!list_servers`,
  handler,
}
