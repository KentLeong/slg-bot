var rp = require('request-promise');
const config = require("../../config.json");
var dateFormat = require('dateformat');

module.exports = {
  checkSpam(msg) {
    rp(`http://${config.db}/slg/logs/check_spam/${msg.author.id}`)
      .then(data => {
        spam = JSON.parse(data).spam
        if (spam) {
          msg.reply("has been muted for 30 seconds for spaming the chat.")
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  checkIfBanned(msg, type, callback) {
    rp(`http://${config.db}/slg/bans/${type}/${msg.author.id}`)
      .then(data => {
        var result = JSON.parse(data)
        if (result.banned == true) {
          var timeleft
          let x = result.duration / 1000
          let seconds = x % 60
          x /= 60
          let minutes = x % 60
          x /= 60
          let hours = x % 24
          x /= 24
          let days = x
          var secondS, minuteS, hourS, dayS = ""
          fseconds = Math.floor(seconds).toString()
          if (fseconds > 1) {secondS = "s"};
          fminutes = Math.floor(minutes).toString()
          if (fminutes > 1) {minuteS = "s"};
          fhours = Math.floor(hours).toString()
          if (fhours > 1) {hourS = "s"};
          fdays = Math.floor(days).toString()
          if (fdays > 1) {dayS = "s"};

          if (fminutes == 0) {
            timeleft = `${fseconds} second${secondS}`
          } else if (fhours == 0) {
            timeleft = `${fminutes} minute${minuteS}, and ${fseconds} second${secondS}`
          } else if (fdays == 0) {
            timeleft = `${fhours} hour${hourS}, and ${fminutes} minute${minuteS}`
          } else {
            timeleft = `${fdays} day${dayS}, and ${fhours} hour${hourS}`
          }
          let output = {
            timeleft: timeleft,
            reason: result.reason,
            banned_by: result.banned_by
          }
          callback(true, output)
        } else {
          callback(false, 0)
        }
      })
      .catch(err => {
        console.log(err)
        callback(false, 0);
      })
  },
  getMentions(msg, num, next) {
    var mentions = []
    msg.mentions.users.map(user=> {
      if (mentions.length == num) {
        msg.reply("Can not have more than "+num+" mentions.")
        return;
      }
      mentions.push(user)
    })
    next(mentions)
  },
  checkChannel(msg, channels, next) {
    if (msg.channel.name == "bot-testing") {
      next(true)
    } else if (channels.includes(msg.channel.name)) {
      next(true)
    } else {
      msg.author.send("Please use `#"+channels[0]+"` for this command")
      msg.delete()
      next(false)
    }
  }
}
