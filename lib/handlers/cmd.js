function handler(bot, msg, args){
  let args_qty = args.length
  let command = args[2] || args[1]
  let server = args[1] == command ? 'default' : args[1]

  let guild_id = msg.channel.guild.id
  let cmd = {
    server,
    command,
  }
  console.log('command', cmd)
  // console.log('servers', bot.servers)
  let server_key = `${cmd.server}_${guild_id}`
  let server_info = bot.servers[server_key]
  let mc_server = server_info.server
  // console.log('server', server)
  msg.reply(`running command '${cmd.command}' on '${cmd.server}'(${server_info.title}))`)
  mc_server.connect().then(async success => {
    // console.log('connected:', success)

    let response = await mc_server.cmd(cmd.command)
    let cleaned = mc_server.clean(response)
    // console.log(cleaned)
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
