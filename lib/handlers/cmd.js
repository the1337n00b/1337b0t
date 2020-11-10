function handler(bot, msg, args){
  let command = args[2] || args[1]
  let server_name = args[1] == command ? null : args[1]

  let guild_id = msg.channel.guild.id
  let server_key = `${server_name}_${guild_id}`
  let server_info = server_name ? bot.servers[server_key] : bot.default_server(msg)

  if (!server_info) return msg.reply(`unknown server: \`${server_name}\`.  Check the spelling and try again.  Use \`!list_servers\` to see all configured servers.`)
  if (!bot.is_op(msg, server_info)) return

  let mc_server = server_info.server
  msg.reply(`running command '${command}' on '${server_name}'(${server_info.title}))`)
  mc_server.connect().then(async success => {
    let response = await mc_server.cmd(command)
    let cleaned = mc_server.clean(response)
    msg.reply(cleaned)
  })
}

module.exports = {
  name: 'cmd',
  commands: ['!cmd'],
  pattern: '^COMMAND +(\\w*) *(.*)',
  syntax: `!cmd {server_name} {minecraft console command goes here}`,
  handler,
}
