function handler(bot, msg, args){
  if (args[1] == 'CONFIRM'){
    msg.reply('The bot is shutting down...').then(() => {
      bot.kill()
    })
  } else {
    msg.reply('This command will shut down the bot.  To continue, reply with the message: `!kill CONFIRM`')
  }
}

module.exports = {
  disabled: true,
  name: 'kill',
  commands: ['!kill'],
  pattern: '^COMMAND *(\\w*)?',
  syntax: `!kill`,
  handler,
}
