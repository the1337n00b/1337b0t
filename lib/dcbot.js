const Discord = require('discord.js')
const prexit = require('prexit')
const postgres = require('postgres')
var sql
var bot_token

const MCServer = require('./mcserver.js')

class DCBot {
  constructor(config) {
    if (!sql) sql = postgres(config.PG_CONN)
    if (!bot_token) bot_token = process.env.BOT_TOKEN

    this.connected = false
    this.servers = {}

    setTimeout(async () => {
      await this.get_servers()
    }, 1000);

    setTimeout(() => {
      process.on("exit", () => { if (this.client) this.client.destroy() })
      prexit(async () => {
        if (this.client) await this.client.destroy()
        await sql.end({ timeout: 2 })
      })
      this.start()
    }, 5000);
  }
  async add_server(srv_obj){
    let inserted = await sql`
      insert into servers ${ sql(srv_obj
        , 'guild_id'
        , 'guild_name'
        , 'creator'
        , 'creator_id'
        , 'name'
        , 'title'
        , 'host'
        , 'port'
        , 'rpass'
        , 'rport'
        , 'def'
      )}
      on conflict (guild_id, name) do update set
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        rport = EXCLUDED.rport,
        rpass = EXCLUDED.rpass,
        title = EXCLUDED.title
      returning *
    `
    let new_server = inserted[0]
    let def_server = await this.get_default_server(srv_obj.guild_id)
    if (!def_server) await set_default_server(new_server.id)
    return new_server
  }
  async set_default_server(id){
    let updated = await sql`update servers set default = true where id = ${id} returning id, default`
    return updated
  }
  async get_default_server(guild_id){
    let def_srv = await sql`select * from servers where default and guild_id = ${guild_id}`
    return def_srv[0]
  }
  async delete_server(srv_obj){
    let deleted = await sql`delete from servers where guild_id = ${srv_obj.quild_id} and name = ${srv_obj.name}`
    return deleted
  }
  async get_servers(id){
    try {
      let servers
      if (id) {
        servers = await sql`select * from servers where id = ${id}`
      } else {
        servers = await sql`select * from servers`
      }
  
      for (let srv of servers) {
        srv.server = new MCServer(srv)
        this.servers[`${srv.name}_${srv.guild_id}`] = srv
        if (srv.def) this.servers[`default_${srv.guild_id}`] = srv
      }

      if (id) return servers[0]
      return servers
    } catch (error) {
      return false
    }
  }
  start(){
    let client = new Discord.Client()
    this.client = client
    client.on('ready', () => {this.connected = true})
    client.on('message', msg => this.msg_handler(msg))
    client.login(bot_token)
  }
  stop(){
    if (this.client) {
      this.client.off('message', this.msg_handler)
      this.client.destroy()
      this.connected = false
    }
  }
  name(){
    this.client.user.tag
  }
  msg_handler(msg){
    let channel = msg.channel.name
    let guild_id = msg.channel.guild.id
    let author_name = msg.author.username
    let author_owner = msg.channel.guild.ownerID === msg.author.id
    // let roles = msg.channel.guild.roles.cache.map(r => { return {name: r.name, id: r.id} })

    // pattern checking
    let setsrv_regex = /^!set_server +(\w*) +(\S+) *?(.*)/gi
    let setsrv_info = setsrv_regex.exec(msg.content.trim())

    let defsrv_regex = /^!default_server +(\w*)/gi
    let defsrv_info = defsrv_regex.exec(msg.content.trim())

    let delsrv_regex = /^!delete_server +(\w*)/gi
    let delsrv_info = delsrv_regex.exec(msg.content.trim())

    let status_regex = /^!status +(\w*)\b/gi
    let status_info = status_regex.exec(msg.content.trim())

    let cmd_regex = /^!cmd +(\w*) +(.*)/gi
    let cmd_info = cmd_regex.exec(msg.content.trim())

    // pattern handling
    if (msg.content === 'ping') {
      this.ping(msg)
    } else if (setsrv_info) {
      this.mc_set_srv(msg, setsrv_info)
    } else if (status_info) {
      this.mc_status(msg, status_info)
    } else if (cmd_info) {
      this.mc_console(msg, cmd_info)
    } else {
      let req_role = 'Twitch Subscriber'
      let authorized = this.has_role(msg, req_role)
      
      if (channel == 'testing') {
        console.log(msg)
        console.log('author_owner', author_owner)
        console.log('authorized:', authorized)
      }
    }

  }
  has_role(msg, role_name){
    let roles = msg.channel.guild.roles.cache.map(r => { return {name: r.name, id: r.id} })
    let role = roles.find(r => r.name === role_name)
    let member_roles = msg.member._roles
    let msg_author_has_role = member_roles.includes(role.id)
    return msg_author_has_role
  }
  ping(msg){
    msg.reply('pong')
  }
  async mc_set_srv(msg, info){
    let srv_info = {
      guild_id: msg.channel.guild.id,
      guild_name: msg.channel.guild.name,
      creator_id: msg.author.id,
      creator: msg.author.username,
      name: info[1],
      title: info[3],
    }

    let address_info = info[2] // 'rpass@address:port:rport'
    let split_at = address_info.split('@')
    if (split_at.length == 2) {
      srv_info.rpass = split_at[0]
      address_info = split_at[1]
    }
    let split_colon = address_info.split(':')
    if (split_colon[0]) srv_info.host   = split_colon[0]
    if (split_colon[1]) srv_info.port   = split_colon[1]
    if (split_colon[2]) srv_info.rport  = split_colon[2]
    
    let srv = await this.add_server(srv_info)
    msg.reply(`Added Host: ${srv.host} ${srv.def ? '(default)' : ''}`)
  }
  mc_srv_delete(msg, info){

  }
  mc_status(msg, info){
    let guild_id = msg.channel.guild.id
    let server_name = status_info[1] || 'default'
    let server_key = `${server_name}_${guild_id}`
    let server = this.servers[server_key].server
    server.connect().then(async success => {
      console.log('connected:', success)

      let status = await server.status
      console.log(status.message)
      msg.reply(status.message)
    })
  }
  mc_console(msg, info){
    let guild_id = msg.channel.guild.id
    let cmd = {
      server: info[1],
      command: info[2],
    }
    console.log('command', cmd)
    // console.log('servers', this.servers)
    let server_key = `${cmd.server}_${guild_id}`
    let server_info = this.servers[server_key]
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
  kill(){
    process.kill(process.pid, "SIGINT")
  }
}

module.exports = DCBot
