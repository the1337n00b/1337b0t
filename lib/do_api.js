const https = require('https')
const do_routes = require('./do_routes')

class DigitalOceanAPI {
  constructor(args) {
    this.hostname = 'api.digitalocean.com'
    this.port = 443

    this.token = args.token
  }
  options(service, ...keys){
    let svc_info = do_routes(service)
    if (!svc_info) return false

    let path = svc_info.path
    for (let k of keys) {
      path = path.replace('$KEY', k)
    }

    let opt = {
      hostname: this.hostname,
      port: this.port,
      method: svc_info.method,
      path,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    }
    return opt
  }
  api(service, postData = {}, ...keys){
    if (typeof postData !== 'object') {
      keys.unshift(postData)
      postData = {}
    }
    let queryString = queryStringify(postData)

    return new Promise((resolve, reject) => {
      let opts = this.options(service, ...keys)
      if (!opts) return reject('invalid route specified')

      if (opts.method === 'GET') opts.path += queryString
      let req = https.request(opts, res => {
        let obj = {
          statusCode: res.statusCode,
          headers: res.headers,
          data: '',
        }
      
        res.on('data', d => {obj.data += d})
        res.on('end', () => {
          try {
            let parsed = JSON.parse(obj.data)
            return resolve(parsed) // if we can parse the json, return it directly
          } catch (error) {
          }
          if (obj.statusCode == 204) return resolve(true) // successful request when no body is returned (eg: delete)
          resolve(obj) // if data isn't valid JSON, return the whole object
        })
      })
      req.on('error', err => reject(err))
      if (opts.method != 'GET' && Object.keys(postData).length){
        req.write(JSON.stringify(postData))
      }
      req.end()
    })
  }

}

function queryStringify(params){
  let queryString = ''
  for (let k in params) {
    let v = params[k];
    queryString += `${k}=${v}&`
  }
  queryString = '?' + queryString.slice(0,-1) // trim off the last "&"
  return queryString
}

module.exports = DigitalOceanAPI
