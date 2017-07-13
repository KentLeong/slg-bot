var rp = require('request-promise');
var rtoken = require('../../helpers/requests/token');
var vuser = require('../../helpers/validations/user');

exports.run = (client, msg, args) => {
  vmessage.validateCommandinChannel(msg, "bot-commands");
  vuser.isAdmin(msg, admin => {
    if (admin) {
      rtoken.deleteAllTokens(msg)
      msg.reply("All tokens have been cleared.")
    }
  })
}
