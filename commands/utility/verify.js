var rp = require('request-promise');
const config = require("../../config.json");
var rtoken = require('../../helpers/requests/token');
var ruser = require('../../helpers/requests/user');
var rriot = require('../../helpers/requests/riot');
var vmessage = require('../../helpers/validations/message');

exports.run = (client, msg, args) => {
  let next
  vmessage.checkChannel(msg, ["bot-commands"], channel => {next=channel})
  if (!next) {return}

  rtoken.hasToken(msg, token => {
    if (!token) {
      msg.reply("You don't have a token, please use `.signup`")
    } else {
      msg.channel.send("Looking up `"+token.league_name+"` for rune page name `"+token.user_token+"`")
      setTimeout(() => {
        msg.channel.send(".")
      }, 1000)
      setTimeout(() => {
        msg.channel.send(".")
      }, 2000)
      setTimeout(() => {
        msg.channel.send(".")
      }, 3000)
      function verify(next) {
        setTimeout(() => {
          rriot.checkRunes(msg, token, vToken => {
            if (!vToken) {
              msg.channel.send("Couldn't match, trying again..")
              next()
            } else {
              ruser.createUser(msg, vToken, user => {
                setTimeout(()=> {
                  ruser.addTag(msg, user.ladder);
                }, 1000)
                setTimeout(()=> {
                  ruser.addTag(msg, "Fill");
                }, 2000)

                msg.guild.members.get(user.discord_id).setNickname(user.league_name)
                rtoken.deleteToken(msg, () => {
                  msg.reply("You are now signed up for slg with the summoner name `"+vToken.league_name+"` You may also choose up to two roles with the `.iam` command")
                })
              })
            }
          })
        }, 4000)
      }
      verify(() => {
        setTimeout(() => {
          msg.channel.send(".")
        }, 4000)
        setTimeout(() => {
          msg.channel.send(".")
        }, 5000)
        setTimeout(() => {
          msg.channel.send(".")
        }, 6000)
        setTimeout(() => {
          rriot.checkRunes(msg, token, vToken => {
            if (!vToken) {
              msg.reply("Could not verify `"+token.user_token+"` in any runepage. Make sure you hit the save button, "+
              "otherwise `.verify` again")
            } else {
              ruser.createUser(msg, vToken, user => {
                setTimeout(()=> {
                  ruser.addTag(msg, user.ladder);
                }, 1000)
                setTimeout(()=> {
                  ruser.addTag(msg, "Fill");
                }, 2000)
                msg.guild.members.get(user.discord_id).setNickname(user.league_name)
                rtoken.deleteToken(msg, () => {
                  msg.reply("You are now signed up for slg with the summoner name `"+vToken.league_name+"` You may also choose up to two roles with the `.iam` command")
                })
              })
            }
          })
        }, 7000)
      })
    }
  })
}
