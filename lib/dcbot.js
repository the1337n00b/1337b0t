const Discord = require('discord.js')
const prexit = require('prexit')
const postgres = require('postgres')
var sql
var bot_token

const MCServer = require('./mcserver.js')
const DOServer = require('./doserver.js')

var commands = require('./commands')

class DCBot {
  constructor(config) {
    if (!sql) sql = postgres(config.PG_CONN)
    if (!bot_token) bot_token = config.BOT_TOKEN

    this.connected = false
    this.servers = {}
    this.guilds = {}

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
    try {
      let inserted = await sql`
        insert into mc_servers ${ sql(srv_obj
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
        )}
        on conflict (guild_id, name) do update set
          host = EXCLUDED.host,
          port = EXCLUDED.port,
          rport = EXCLUDED.rport,
          rpass = EXCLUDED.rpass,
          title = EXCLUDED.title
        returning *
      `
      let srv_info = inserted[0]
      let brand_spanking_new = srv_info.updated.getTime() === srv_info.created.getTime()
  
      let def_server = await this.get_default_server(srv_obj.guild_id)
      if (!def_server) srv_info = await this.set_default_server(srv_info.id)
  
      srv_info.new = brand_spanking_new
      await this.get_servers(srv_info.id)
      await this.get_guilds(srv_info.guild_id)
      return srv_info
    } catch (error) {
      console.error(error)
      return false
    }
  }
  async set_default_server(id){
    try {
      let updated = await sql`update mc_servers set def = true where id = ${id} returning *`
      let def_srv = updated[0]
      if (def_srv) {
        await this.get_servers(def_srv.id)
        await this.get_guilds(def_srv.guild_id)      
      }
      return def_srv
    } catch (error) {
      console.error(error)
      return false
    }
  }
  async get_default_server(guild_id){
    let guild_servers = await this.get_guild_servers(guild_id)
    let first_srv = guild_servers[0] || {}
    let def_srv = first_srv.def ? first_srv : null
    return def_srv
  }
  async get_guild_servers(guild_id){
    try {
      let servers = await sql`select * from mc_servers where guild_id = ${guild_id} order by def desc`
      return servers
    } catch (error) {
      console.error(error)
      this.kill()
    }
  }
  async delete_server(srv_obj){
    let deleted = await sql`delete from mc_servers where guild_id = ${srv_obj.guild_id} and name = ${srv_obj.name}`
    if (deleted.count){
      delete this.servers[`${srv_obj.name}_${srv_obj.guild_id}`]
      if (srv_obj.def) delete this.servers[`default_${srv_obj.guild_id}`]
    }
    return deleted
  }
  async get_servers(id){
    try {
      let servers
      if (id) {
        servers = await sql`select * from mc_servers where id = ${id}`
      } else {
        servers = await sql`select * from mc_servers`
      }

      for (let srv of servers) {
        srv.server = new MCServer(srv)
        this.servers[`${srv.name}_${srv.guild_id}`] = srv
        if (srv.def) this.servers[`default_${srv.guild_id}`] = srv
      }

      await this.get_guilds()
      if (id) return servers[0]
      return servers
    } catch (error) {
      return false
    }
  }
  async require_dms(guild_id, require = true){
    let updated = await sql`update dc_servers set require_dm = ${require} where guild_id = ${guild_id} returning *`
    let guild = updated[0]
    if (updated.length) this.guilds[guild_id] = guild
    return guild
  }
  async get_guilds(guild_id){
    try {
      let guilds
      if (guild_id) {
        guilds = await sql`select * from dc_servers where guild_id = ${guild_id}`
      } else {
        guilds = await sql`select * from dc_servers`
      }

      for (let g of guilds) {
        this.guilds[g.guild_id] = g
      }
      
      this.set_channel_defaults()
      return guilds
    } catch (error) {
      return false
    }
  }
  async save_guild(guild_obj){
    let save_obj = {
      admins: JSON.stringify(guild_obj.admins),
      defaults: JSON.stringify(guild_obj.defaults),
      do_servers: JSON.stringify(guild_obj.do_servers),
    }
    try {
      let inserted = await sql`
        update dc_servers set ${ sql(save_obj
          , 'admins'
          , 'defaults'
          , 'do_servers'
        )} where id = ${guild_obj.id}
      `
      await this.get_guilds(guild_obj.guild_id)
      return true
    } catch (error) {
      console.error(error)
      this.kill()
    }
  }
  async start(){
    let client = new Discord.Client()
    this.client = client
    client.on('ready', () => {this.connected = true})
    client.on('message', msg => this.msg_handler(msg))
    client.login(bot_token)
    await this.get_servers()
    await this.get_guilds()
  }
  stop(){
    if (this.client) {
      this.client.off('message', this.msg_handler)
      this.client.destroy()
      this.connected = false
    }
  }
  set_channel_defaults(){
    for (let guild_id in this.guilds) {
      let guild = this.guilds[guild_id]
      let channel_keys = Object.keys(guild.defaults).filter(k => k.match(/^CH#(.+)/))
      for (let ch_key of channel_keys) {
        let def_srv_id = guild.defaults[ch_key]
        let channel_id = ch_key.replace(/^CH#/, '')
        let channel_def_key = `default_${guild.guild_id}_${channel_id}`
        let srv // = this.servers.find(s => s.id == def_srv_id)
        for (let s in this.servers) {
          let val = this.servers[s]
          if (val.id == def_srv_id) {
            srv = val
            break
          }
        }
        this.servers[channel_def_key] = srv
        let debug = true
      }
    }
  }
  default_server(msg){
    let guild_id = msg.channel.guild.id
    let channel_id = msg.channel.id

    let guild_def_key = `default_${guild_id}`
    let channel_def_key = `default_${guild_id}_${channel_id}`

    let defs = {
      guild: this.servers[guild_def_key],
      channel: this.servers[channel_def_key],
    }

    return defs.channel || defs.guild
  }
  read_msg(msg){
    let guild = this.guilds[msg.channel.guild.id]

    let dm_regex = new RegExp(`^<@!${this.client.user.id}> *(.*)`)
    let dm = dm_regex.exec(msg.content)
    let msg_text = dm ? dm[1] : msg.content

    if (guild.require_dm){
      if (dm) return msg_text
    } else {
      return msg_text
    }
  }
  msg_handler(msg){
    if (msg.author.id === this.client.user.id) return // ignore msgs sent from this bot
    let msg_text = this.read_msg(msg)
    if (!msg_text) return

    let channel = msg.channel.name
    let guild_id = msg.channel.guild.id
    let author_name = msg.author.username
    // let roles = msg.channel.guild.roles.cache.map(r => { return {name: r.name, id: r.id} })

    let cmd_found = false
    for (let cmd of commands) { // cmd = { name, commands, pattern, syntax, handler }
      let aliases = cmd.commands
      for (let a of aliases) {
        let pattern_string = cmd.pattern.replace('COMMAND', a)
        let pattern = new RegExp(pattern_string, 'gi')
        let cmd_args = pattern.exec(msg_text.trim())
        if (cmd_args){
          cmd_found = true

          let authorized = true
          try {
            if (authorized) cmd.handler(this, msg, cmd_args)
          } catch (error) {
            console.error(error)
          }
          break
        }
      }

      if (cmd_found) break
    }

    if (!cmd_found){
      let req_role = 'Twitch Subscriber'
      let authorized = this.has_role(msg, req_role)
      
      if (channel == 'testing') {
        console.log(msg)
        console.log('author_owner', this.is_owner(msg))
        console.log('authorized:', authorized)
      }
    }
  }
  is_owner(msg){
    return msg.channel.guild.ownerID === msg.author.id
  }
  is_admin(msg){ // admins can add/edit/remove mc servers for the guild
    if (this.is_owner(msg)) return true
  }
  is_op(msg, srv){ // op has FULL console access to mc server
    if (this.is_owner(msg)) return true
  }
  has_role(msg, role_name){
    let roles = msg.channel.guild.roles.cache.map(r => { return {name: r.name, id: r.id} })
    let role = roles.find(r => r.name === role_name)
    let member_roles = msg.member._roles
    let msg_author_has_role = member_roles.includes(role.id)
    return msg_author_has_role
  }
  async kill(){
    if (this.client) await this.client.destroy()
    await sql.end({ timeout: 2 })
    process.kill(process.pid, "SIGINT")
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DCBot
