var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  logMessage(msg) {
    let name = msg.author.username + "#" + msg.author.discriminator;
    var options = {
      method: "POST",
      uri: `http://${config.db}/slg/logs/chat/new`,
      body: {
        "channel": msg.channel.name,
        "name": name,
        "discord_id": msg.author.id,
        "content": msg.content
      },
      json: true
    }
    rp(options)
      .then(() => {
        return
      })
      .catch(err => {
        console.log("Chat log failed: "+err)
      })
  },
  logCommandEvent(msg, type, action) {
    let name = msg.author.username + "#" + msg.author.discriminator;
    var options = {
      method: "POST",
      uri: `http://${config.db}/slg/logs/event/new`,
      body: {
        "channel": msg.channel.name,
        "name": name,
        "discord_id": msg.author.id,
        "content": action
      },
      json: true
    }
    rp(options)
      .then(() => {
        return
      })
      .catch(err => {
        console.log("Chat log failed: "+err)
      })
  }
};
