async function handler(bot, msg, args){
  let srv_info = {
    guild_id: msg.channel.guild.id,
    guild_name: msg.channel.guild.name,
    creator_id: msg.author.id,
    creator: msg.author.username,
    name: args[1],
    title: (args[3] || '').trim(),
  }

  let address_info = args[2] // 'rpass@address:port:rport'
  let split_at = address_info.split('@')
  if (split_at.length == 2) {
    srv_info.rpass = split_at[0]
    address_info = split_at[1]
  }
  let split_colon = address_info.split(':')
  if (split_colon[0]) srv_info.host   = split_colon[0]
  if (split_colon[1]) srv_info.port   = split_colon[1]
  if (split_colon[2]) srv_info.rport  = split_colon[2]
  
  if (!(srv_info.host && srv_info.port)){
    msg.reply(`both address & port are required [format: rcon_password@address:port:rcon_port]`)
  } else {
    let srv = await bot.add_server(srv_info)
    msg.reply(`${srv.new ? 'Added' : 'Updated'} Host: ${srv.host} ${srv.def ? '(default)' : ''}`)
  }
}

module.exports = {
  name: 'set_server',
  commands: ['!set_server'],
  pattern: '^COMMAND +(\\w*) +(\\S+) *(.*)',
  syntax: `!set_server {server_name} rpass@address:port:rport {user friendly server title goes here}`,
  handler,
}
