function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let cmd = {
    server: args[1],
    command: args[2],
  }
  console.log('command', cmd)
  // console.log('servers', bot.servers)
  let server_key = `${cmd.server}_${guild_id}`
  let server_info = bot.servers[server_key]
  let server = server_info.server
  console.log('server', server)
  msg.reply(`running command '${cmd.command}' on '${cmd.server}'(${server_info.title}))`)
  server.connect().then(async success => {
    console.log('connected:', success)

    let response = await server.cmd(cmd.command)
    console.log(response)
    msg.reply(response)
  })
}

module.exports = {
  name: 'cmd',
  commands: ['!cmd'],
  pattern: '^COMMAND +(\\w*) +(.*)',
  syntax: `!cmd {server_name} {minecraft console command goes here}`,
  handler,
}
