var rp = require('request-promise');
const config = require("../../config.json");


module.exports = {
  isAdmin(msg, callback) {
    if (config.admin.includes(msg.author.id)) {
      callback(true)
    } else {
      msg.reply("You have to be an admin to do that!")
      callback(false)
    }
  },
  isStaff(msg, callback) {
    if (config.staff.includes(msg.author.id)) {
      callback(true)
    } else {
      msg.reply("You have to be staff to do that!")
      callback(false)
    }
  },
  isUser(msg, callback) {
    rp(`http://${config.db}/slg/users/${msg.author.id}`)
      .then(data => {
        var user = JSON.parse(data).user
        if (user != null) {
          callback(true)
        } else {
          msg.reply("You need to be signed up to do that. Please use `.signup` to get started")
          callback(false)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
}
