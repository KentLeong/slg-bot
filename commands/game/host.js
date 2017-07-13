var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ruser = require('../../helpers/requests/user');
var rstats = require('../../helpers/requests/stats');
var ractivity = require('../../helpers/requests/activity');
var dchannel = require('../../helpers/discord/channel')

const current_gamemodes = ["solo", "aram"]

exports.run = (client, msg, args) => {
  let next
  vmessage.checkChannel(msg, ["slg"], channel => {next=channel})
  if (!next) {return}
  vuser.isStaff(msg, staff => {
    if (staff) {
      ractivity.checkActive(msg.author, result => {
        if (result.active) {
          msg.reply("You already `"+result.action+"ed` a `"+result.type+"` game named `"+result.name+"`.")
        } else {
          if (args.length < 2) {
            msg.reply("that is an invalid game mode. Please make sure you follow the following guidelines `.host {game_type} {game_name}` for example, `.host solo Anthony is gay`")
          } else {
            var type = args.shift().toLowerCase()
            var roomName = args.join(" ")
            var queryName = args.join("").toLowerCase()
            var valid_modes = current_gamemodes
            if (!valid_modes.includes(type)) {
              msg.reply("Thats not a valid game mode. The current game modes are `solo` and `aram`")
              return
            }
            if (roomName.length > 16) {
              msg.reply("Game name cannot be more than 16 characters")
              return
            } else if (roomName.length < 3) {
              msg.reply("Game name must be more than 2 characters")
              return
            }
            rhost.checkRoomName(queryName, callback => {
              if (callback.hosted) {
                msg.reply("The game room "+roomName+" is already being used by "+callback.host+". Please use another.")
              } else {
                rhost.newRoom(msg.author, type, roomName, callback => {
                  if (!callback) {
                    msg.reply("Couldn't host game. Try again later.")
                  } else {
                    let gName = args.join("-").toLowerCase()
                    dchannel.createGameChannels(msg, type, gName, (channel) => {
                      ruser.getUser(msg.member, user => {
                        rstats.lookupLadder(msg.member, type, ladder => {
                          var username_space = 17 - user.league_name.length;
                          var soloq_rank_space = 14 - user.ladder.length;
                          var rank
                          (ladder.rank == 0) ? rank = "-" : rank = ladder.rank
                          var rank_space = 7 - rank.toString().length;
                          msg.guild.channels.find("name", channel).sendEmbed({
                            color: 3447003,
                            fields: [{
                              name: `${type.toUpperCase()} - ${roomName}`,
                              value: "```Python\n"+
                                     "1.  " + user.league_name + " ".repeat(username_space) + user.ladder + " ".repeat(soloq_rank_space) + rank + " ".repeat(rank_space) + ladder.elo + "\n"+
                                     "----------------------------------------------\n"+
                                     "```"+
                                     "------------------------------------------------------------"+
                                     "-----------------------------"

                            }]
                          })
                        })
                      })
                    })
                    ractivity.create(msg.member, type, "host", roomName, result => {})
                    msg.channel.send(msg.author+" is hosting a `"+type+"` game. copy and paste `.join "+roomName+"` to join!")
                  }
                })
              }
            })
          }
        }
      })
    }
  })
}
