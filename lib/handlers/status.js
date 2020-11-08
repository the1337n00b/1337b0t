function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let server_name = args[1] || 'default'
  let server_key = `${server_name}_${guild_id}`
  let server = bot.servers[server_key].server
  server.connect().then(async success => {
    console.log('connected:', success)

    let status = await server.status
    console.log(status.message)
    msg.reply(status.message)
  })
}

module.exports = {
  name: 'status',
  commands: ['!status'],
  pattern: '^COMMAND +(\\w*)',
  syntax: `!status {server_name}`,
  handler,
}
