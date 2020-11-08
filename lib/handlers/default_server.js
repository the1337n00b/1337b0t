async function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let name = args[1]
  let srv = bot.servers[`${name}_${guild_id}`]
  let sql_result = await bot.set_default_server(srv.id)
  let is_default = sql_result.def
  msg.reply(`${srv.name} [${srv.title}] ${srv.host} ${is_default ? 'WAS' : ' WAS NOT'} successfully saved as the default`)
}

module.exports = {
  name: 'default_server',
  commands: ['!default_server'],
  pattern: '^COMMAND +(\\w*)',
  syntax: `!default_server {server_name}`,
  handler,
}
