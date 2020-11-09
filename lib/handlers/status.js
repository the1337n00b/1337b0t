function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let server_name = args[1]
  let server_key = `${server_name}_${guild_id}`
  let server = server_name ? bot.servers[server_key] : bot.default_server(msg)
  if (!server) return

  let mc_server = server.server
  if (mc_server) mc_server.connect().then(async success => {
    if (!success) return msg.reply(`${server.name} is offline`)

    let status = await mc_server.status
    msg.reply(status.message)
  })
}

module.exports = {
  name: 'status',
  commands: ['!status'],
  pattern: '^COMMAND *(\\w*)',
  syntax: `!status {server_name}`,
  handler,
}
