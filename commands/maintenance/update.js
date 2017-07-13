var rp = require('request-promise');
const config = require("../config.json");

exports.run = (client, msg, args) => {
  if (msg.channel.name != "bot-commands" || msg.channel.name == "bot-testing") {
    msg.channel.send("Please use `#bot-commands` for this")
    return
  }
};
