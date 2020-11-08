var DigitalOceanAPI = require('./do_api');

class DOServer {
  constructor(args) {
    this.client = new DigitalOceanAPI({ token: args.DO_TOKEN })

    this.rconpass = args.RCON_PASS || 'P@ssw0rd'

    this.docker_image = args.docker_image || 'the1337n00b/amongus_mc:latest'

    this.host = args.host || 'docker'
    this.domain = args.domain
    this.cname = args.cname || 'download' // friendly name for server
    this.srv = '_minecraft._tcp'
    
    this.region = args.region || "nyc1"
    this.size = args.size || "s-1vcpu-2gb"

    this.key = args.key || 'myComputer' // ssh key name
    this.vpc = args.vpc || 'default-nyc1' // virtual private cloud name
    this.volume = args.volume || 'configs' // name of volume for storing persistent data (whitelists, etc.)

    this.ready = false
    this.error = null // most recent error
    setTimeout(async () => {
      try {
        this.key_id = (await this.client.api('keys.list')).ssh_keys.find(k=>k.name==this.key).id
        this.vpc_uuid = (await this.client.api('vpcs.list')).vpcs.find(v=>v.name==this.vpc).id
        this.vol_uuid = (await this.client.api('volumes.list')).volumes.find(v=>v.name==this.volume).id
        this.ready = !!(this.key_id && this.vpc_uuid && this.vol_uuid)
      } catch (error) {
        this.error = error       
      }
    }, 0);

    this.info = {}
    this.droplet = {}

    this.max_extend = 90
    this.default_expire = 60 // set to 0 to disable
    this.expire_warning = 10 // default warning minutes
    this.warning_handler = () => {}
  }
  get opts(){
    return {
      name: this.fqdn,
      region: this.region,
      size: this.size,
      image: "docker-20-04",
      ssh_keys: [this.key_id],
      backups: false,
      ipv6: false,
      vpc_uuid: this.vpc_uuid,
      volumes: [this.vol_uuid],
      tags: ["minecraft"],
      user_data: [
        '#!/bin/bash',
        `export RCONPASS=${this.rconpass}`,
        'export RPHOST=$(curl -s http://169.254.169.254/metadata/v1/hostname)', // resource pack hostname
        'mkdir -p /mnt/configs',
        'mount -o discard,defaults,noatime /dev/disk/by-id/scsi-0DO_Volume_configs /mnt/configs',
        'echo "/dev/disk/by-id/scsi-0DO_Volume_configs /mnt/configs ext4 defaults,nofail,discard 0 0" | sudo tee -a /etc/fstab',
        `docker run --restart always --name minecraft -e RPHOST -e RCONPASS -p 80:80 -p 25565:25565 -p 25575:25575 -v /mnt:/mnt -d ${this.docker_image}`,
      ].join("\n"),
    }
  }
  get fqdn(){
    return `${this.host}.${this.domain}`
  }
  start(){
    let opts = this.opts
    return new Promise(async (resolve, reject) => {
      if (!this.ready) return resolve(false)

      let fqdn = `${this.host}.${this.domain}`
      opts.name = this.fqdn

      try {
        let {droplet} = await this.client.api('droplets.create', opts)
        this.info = {}

        let network_checks = 0
        do {
          await sleep(1500)
          this.droplet = (await this.client.api('droplets.get', droplet.id)).droplet
        } while (network_checks++ < 10 && !(this.droplet.networks && this.droplet.networks.v4));

        this.info.ip_addr = this.droplet.networks.v4.find(n => n.type == 'public').ip_address

        if (this.domain){
          this.info.a_records_before = (await this.client.api('domains.records.list', {type:'A', name:`${this.fqdn}`}, this.domain)).domain_records
          this.info.a_records_deleted = []
          for (let r of this.info.a_records_before) {
            let deleted = await this.client.api('domains.records.delete', this.domain, r.id)
            this.info.a_records_deleted.push(r)
          }
          this.info.dns_record = (await this.client.api('domains.records.create', {type:'A', ttl:600, name:this.host, data:this.info.ip_addr}, this.domain)).domain_record
          if (this.srv){
            let srv_records = (await this.client.api('domains.records.list', {type:'SRV', name:`${this.srv}.${this.domain}`}, this.domain)).domain_records
            if (srv_records.length) {
              let r = srv_records[0]
              this.info.srv_record = (await this.client.api('domains.records.update', {data: `${this.fqdn}.`}, this.domain, r.id)).domain_record
            }
          }
    
          if (this.cname) {
            this.info.cname_records_before = (await this.client.api('domains.records.list', {type:'CNAME', name:`${this.cname}.${this.domain}`}, this.domain)).domain_records
            this.info.cname_records_after = []
            for (let r of this.info.cname_records_before) {
              let updated = (await this.client.api('domains.records.update', {data: `${this.fqdn}.`}, this.domain, r.id)).domain_record
              this.info.cname_records_after.push(updated)
            }
          }
        }

        if (this.default_expire) this.extend(this.default_expire)
        resolve(true)
      } catch (error) {
        this.error = error
        resolve(false)
      }
    })
  }
  extend(mins){
    if (mins > this.max_extend) mins = this.max_extend 

    let new_time = new Date().getTime() + (mins * 60 * 1000)
    this.expires_at = new Date(new_time)
  }
  get expires_at(){
    return this.expiry
  }
  set expires_at(dt){
    let now = new Date()
    if (dt <= now) return
    this.expiry = dt

    this.clear_expiration()

    let duration = dt.getTime() - now.getTime()
    this.expire_timer = setTimeout(async () => {
      if (await this.status) await this.stop()
    }, duration)
    this.warning_timer = setTimeout(() => {
      this.warning_handler(this.expires_at)
    }, duration - (this.expire_warning * 60 * 1000))
  }
  clear_expiration(){
    clearTimeout(this.expire_timer)
    clearTimeout(this.warning_timer)
  }
  stop(){
    return new Promise(async (resolve, reject) => {
      let droplet_exists = await this.status
      if (!droplet_exists) return resolve(null)

      try {
        let del_droplet = await this.client.api('droplets.delete', this.droplet.id)
        let del_dns = await this.client.api('domains.records.delete', this.domain, this.info.dns_record.id)

        if (del_droplet) this.droplet = {}
        if (del_dns) this.info = {}

        resolve(del_droplet && del_dns)
      } catch (error) {
        this.error = error
        resolve(false)
      }

    })
  }
  get status(){
    return new Promise(async (resolve, reject) => {
      if (!this.droplet.id) return resolve(false)

      let {droplet} = await this.client.api('droplets.get', this.droplet.id)
      let exists = (droplet && droplet.id == this.droplet.id)
      return resolve(exists)
    })
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = DOServer

// start_server('docker3', 'amongus.the1337n00b.com', {cname:'download', srv:'_minecraft._tcp'}).then(r => {server = r; console.log(r);})
