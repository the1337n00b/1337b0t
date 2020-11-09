async function handler(bot, msg, args){
  let guild_id = msg.channel.guild.id
  let guild = bot.guilds[guild_id]
  let cmd = args[1]
  
  if (cmd == '!require_dm' || cmd == '!require_dms'){
    guild = await bot.require_dms(guild_id, true)
  } else if (cmd == '!dm_toggle'){
    guild = await bot.require_dms(guild_id, !guild.require_dm)
  }

  if (guild.require_dm){
    msg.reply(`The bot requires DMs.  Each command must start with <@!${bot.client.user.id}>`)
  } else {
    msg.reply(`The bot does not requires DMs.`)
  }
}

module.exports = {
  name: 'dm_toggle',
  commands: ['!dm_toggle', '!require_dm', '!require_dms'],
  pattern: '^(COMMAND)\\b',
  syntax: `!dm_toggle {server_name}`,
  handler,
}
