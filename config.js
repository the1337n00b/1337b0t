var config_json
try {
  config_json = require('./config.json')
} catch (error) {
  config_json = {}
}

// if the creds aren't found in config.json we'll check for ENV VARS
var config = JSON.parse(JSON.stringify(config_json))
if (!config.PG_CONN) config.PG_CONN = process.env.PG_CONN
if (!config.BOT_TOKEN) config.BOT_TOKEN = process.env.BOT_TOKEN

module.exports = config
