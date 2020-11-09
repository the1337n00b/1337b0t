function handler(bot, msg, args){
  let command = args[2] || args[1]
  let server_name = args[1] == command ? null : args[1]

  let guild_id = msg.channel.guild.id
  let server_key = `${server_name}_${guild_id}`
  let server_info = server_name ? bot.servers[server_key] : bot.get_default_server(msg)
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
