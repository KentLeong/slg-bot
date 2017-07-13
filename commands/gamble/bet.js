var rp = require('request-promise');
const config = require("../config.json");

exports.run = (client, msg, args) => {
  if (msg.channel.name != "gamble" || msg.channel.name == "gamble") {
    msg.channel.send("Please use `#gamble` for this")
    return
  }
};
