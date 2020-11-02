const util = require('minecraft-server-util')

class MCServer {
  constructor(args) {
    this.host  = args.host || false,
    this.port  = args.port || 25565,
    this.rpass = args.rpass || '',
    this.rport = args.rport || 25575,
    this.wait  = args.wait || 5
    this.debug = !!args.debug

    this.connected = null // timestamp of last connection

    this.raw_status = {}
    this.icon = null
    this.version = ''
    this.description = ''
  }

  async connect(){
    if (!this.host) return false
    if (!this.stale) return true // only reconnect if elapsed time since last connect > args.wait (seconds)
    try {
      let status = await util.status(this.host, {port: this.port}) // port is optional, defaults to 25565
      this.connected = new Date()
      this.status = status

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
  stale(){
    if (!this.connected) return true

    let elapsed = (new Date() - this.connected)/1000
    return elapsed > this.wait
  }
  set status(status) {
    this.raw_status = status
    if (status.srvRecord) {
      this.host = status.srvRecord.host
      this.port = status.srvRecord.port
    }
    this.icon = status.favicon
    this.version = status.version
    this.description = status.description.descriptionText
  }
  get status(){
    return new Promise(async (resolve, reject) => {
      await this.connect()
      let status = this.raw_status
  
      let players_raw = status.samplePlayers || []
      let players = players_raw.map(obj => obj.name)
  
      let info = {}
      info.max_allowed = status.maxPlayers
      info.players = {
        raw: players_raw,
        count: status.onlinePlayers,
        list: players,
      }
      info.message = `${info.players.count} of ${info.max_allowed} players online (${players.join(' ')})`
  
      resolve(info)
    })
  }
  clean(txt){
    let cleaned = txt.replace(/Â§[\d\w]/g, "")
    return cleaned
  }
  cmd(command){
    return new Promise(async (resolve, reject) => {
      if (!command) resolve(false)
      let progress
      try {
        let client = new util.RCON(this.host, { port: this.rport, password: this.rpass })
        client.on('output', async response => {
          resolve(response)
          await client.close()
        })

        progress = 'connecting'
        await client.connect()
        progress = 'running command'
        client.run(command)
        progress = 'awaiting response'
      } catch (error) {
        resolve(`error encountered while ${progress}`)
      }
    })
  }
}

module.exports = MCServer