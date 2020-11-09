async function handler(bot, msg, args){
  if (!bot.is_admin(msg)) return

  let guild_id = msg.channel.guild.id
  let server_name = args[1]
  let confirm = args[2] === 'CONFIRM'

  let server_key = `${server_name}_${guild_id}`
  let server = bot.servers[server_key]

  if (server && !confirm){
    await bot.sleep(500)
    msg.reply(`This command will DELETE the settings for server \`${server.name}\`.`)
    await bot.sleep(500)
    msg.reply(`To continue, reply with the message: \`!delete ${server.name} CONFIRM\``)
    await bot.sleep(500)
    msg.reply(`WARNING: This operation CANNOT be undone!`)
  } else if (server){
    await bot.delete_server(server)
    msg.reply(`The \`${server.name}\` server config has been deleted`)
  }
}

module.exports = {
  name: 'delete_server',
  commands: ['!delete_server', '!delete'],
  pattern: '^COMMAND +(\\w+) *(\\w*)?',
  syntax: `!delete_server {server_name}`,
  handler,
}
