async function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let guild = bot.guilds[guild_id]
  let channel_id = msg.channel.id

  let name = args[1]
  if (name && name != 'DELETE'){
    let srv = bot.servers[`${name}_${guild_id}`]
    guild.defaults[`CH#${channel_id}`] = srv.id
    await bot.save_guild(guild)

    let ch_srv = bot.servers[`default_${guild_id}_${channel_id}`]
    msg.reply(`${ch_srv.name} [${ch_srv.title}] is the default server for this CHANNEL`)
  } else if (name && name == 'DELETE') {
    delete bot.servers[`default_${guild_id}_${channel_id}`]
    delete guild.defaults[`CH#${channel_id}`]
    await bot.save_guild(guild)

    let srv = bot.default_server(msg)
    msg.reply(`The default Minecraft server for this CHANNEL has been deleted`)
    msg.reply(`${srv.name} [${srv.title}] is the default Minecraft server for this Discord SERVER`)
  } else {
    let ch_srv = bot.servers[`default_${guild_id}_${channel_id}`]

    if (ch_srv){
      msg.reply(`${ch_srv.name} [${ch_srv.title}] is the default server for this CHANNEL`)
    } else {
      let srv = bot.default_server(msg)
      msg.reply(`A default server has not been specified for this channel`)
      msg.reply(`${srv.name} [${srv.title}] is the default server for this SERVER`)
    }
  }
}

module.exports = {
  name: 'channel_default',
  commands: ['!channel_default'],
  pattern: '^COMMAND *(\\w*)',
  syntax: `!channel_default {server_name}`,
  handler,
}
