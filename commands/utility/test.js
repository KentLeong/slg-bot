var rp = require('request-promise');
var rtoken = require('../../helpers/requests/token');
var ruser = require('../../helpers/requests/user');
var rhost = require('../../helpers/requests/host');
var rstats = require('../../helpers/requests/stats');
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
const config = require("../../config.json");

exports.run = (client, msg, args) => {
  let next
  vuser.isAdmin(msg, admin => {next = admin})
  if (!next){return}
  rhost.startSpec("26503645", found => {
    if (found) {
      msg.reply("```successfully found game```")
    } else {
      msg.reply("failed to find game")
    }
  })
};


// msg.guild.members.get(user[1].id).setNickname("Not-Signed-Up")
