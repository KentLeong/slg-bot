var rp = require('request-promise');
var rlog = require('../helpers/requests/log');
var vmessage = require('../helpers/validations/message');
exports.run = (client, msg) => {
  if (msg.author.bot) return;
  if (msg.channel.type == "dm") return;
  vmessage.checkIfBanned(msg, "mute", (banned, output) => {
    if (!banned) {
      rlog.logMessage(msg);
      vmessage.checkSpam(msg);
    } else {
      msg.author.send("You are muted from SLG for `"+output.timeleft+"`, by `"+output.banned_by+"`\n"+
                  "Reason: `"+output.reason+"`")
      msg.delete()
    }
  })
}
