var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ruser = require('../../helpers/requests/user')
var ractivity = require('../../helpers/requests/activity');
var dchannel = require("../../helpers/discord/channel")

const current_gamemodes = ["solo", "aram"]

exports.run = (client, msg, args) => {
  vuser.isUser(msg, isUser => {
    if (isUser) {
      ractivity.checkActive(msg.author, result => {
        if (!result.active) {
          msg.reply("You aren't doing anything. what are you leaving from?")
        } else {
          let gName = result.name.split(" ").join("-").toLowerCase()
          let text_channel = result.type+"-"+gName
          vmessage.checkChannel(msg, [text_channel, "bot-testing"], channel => {
            if (result.type == "solo" ||  result.type == "aram") {
              var query_name = result.name.split(" ").join("").toLowerCase()
              rhost.checkRoomName(query_name, result2 => {
                let host = client.users.get(result2.room.host)
                if (result2.room.draft_start) {
                  if (result2.room.game_start) {
                    msg.reply("You're in game right now, can't leave. If it's an emergancy, let "+host+" know.")
                  } else {
                    msg.reply("Draft has already started, are you sure you want to leave? Penalties may apply.\n"+
                    "Let the host "+host+" know if you want to leave")
                  }
                } else {
                  rhost.leaveRoom(msg.author, query_name, result => {
                    ruser.getUser(msg.author, user => {
                      if (result.success) {
                        ractivity.end(msg.author, result => {
                          dchannel.leaveGameChannel(client, msg, gName, result2.room, () => {})
                          msg.channel.send("```"+user.league_name+" left the lobby```")
                        })
                      } else {
                        msg.reply("Couldn't leave game for some reason")
                      }
                    })
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}
