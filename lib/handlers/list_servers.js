async function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let servers = await bot.get_guild_servers(guild_id)
  // format the response to look nice
  let srv_arr = []
  for (let s of servers) {
    let srv = bot.servers[`${s.name}_${s.guild_id}`]
    srv_arr.push(`${srv.name} [${srv.title}] ${srv.host}:${srv.port}${srv.rport ? ':' + srv.rport : ''} ${srv.def ? '(default)' : ''}`)
  }
  msg.reply(srv_arr.join("\n"))
}

module.exports = {
  name: 'list_servers',
  commands: ['!list_servers'],
  pattern: '^COMMAND\\b',
  syntax: `!list_servers`,
  handler,
}
