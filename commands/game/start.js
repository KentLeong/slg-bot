var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ractivity = require('../../helpers/requests/activity');
var rstats = require('../../helpers/requests/stats');
var ruser = require('../../helpers/requests/user');
var f = require('../../helpers/format')

const current_gamemodes = ["solo", "aram"]

exports.run = (client, msg, args) => {
  vuser.isStaff(msg, staff => {
    if (staff) {
      rhost.getRoomByID(msg.member, result => {
        if (!result.success) {
          msg.reply("Youre not hosting a game.")
        } else if (result.room.draft_start == true) {
          if (result.room.game_start == true) {
            msg.reply("Draft ended and currently in game")
          } else {
            msg.reply("Draft already started")
          }
        } else {
          let next
          let text_channel = result.room.type+"-"+(result.room.name.split(" ").join("-").toLowerCase())
          vmessage.checkChannel(msg, [text_channel], channel => {
            if (channel) {
              let userCount = result.room.users.length
              let s
              (userCount == 9) ? s = "" : s = "s"
              if (userCount != 10) {
                msg.reply("Need "+(10-userCount)+" more player"+s+" to start.")
              } else {
                rhost.getRoomByID(msg.member, result => {
                  if (!result.success) {
                    msg.reply("Couldn't find the room")
                  } else {
                    if (result.room.users.length != 10) {
                      msg.channel.send("Game was not started. Someone left.")
                    } else {
                      var uStats = []
                      function userStatsCallback(callback) {
                        for (let userID of result.room.users) {
                          let user = client.users.get(userID)
                          rstats.lookupLadder(user, result.room.type, userStat => {
                            ruser.getUser(user, u => {
                              uStats.push({
                                  u: u,
                                  s: userStat
                                })
                            })
                          })
                        }
                        callback()
                      }
                      userStatsCallback(() => {
                        setTimeout(() => {
                          uStats.sort((a,b) => {
                            return parseFloat(b.s.elo) - parseFloat(a.s.elo)
                          })
                          var highestUsers = []
                          function statCallback(callback) {
                            uStats.forEach((u2, index) => {
                              if (index == 0 || index == 1) {
                                highestUsers.push(u2)
                              } else if (highestUsers[1].s.elo == u2.s.elo) {
                                highestUsers.push(u2)
                              }
                            })
                            callback()
                          }
                          statCallback(() => {
                            if (highestUsers[0].s.elo > highestUsers[1].s.elo && highestUsers.length == 2) {
                              var cap1 = client.users.get(highestUsers[0].u.discord_id)
                              var cap2 = client.users.get(highestUsers[1].u.discord_id)
                              var x = {host: msg.author.id, cap1: cap1.id, cap2: cap2.id}
                              rhost.pushHighestElosIntoRoom(x, () => {
                                msg.channel.send("The captains are "+cap1+" and "+cap2+"\n"+
                                cap2+ " please pick if you want first or second pick with `.fp` or `.sp`")
                              })
                            } else if (highestUsers.length == 10 && highestUsers[0].s.elo == highestUsers[1].s.elo) {
                              highestUsers.sort((a,b) => {
                                return  parseFloat(b.u.elo) - parseFloat(a.u.elo)
                              })
                              var cap1 = client.users.get(highestUsers[0].u.discord_id)
                              var cap2 = client.users.get(highestUsers[1].u.discord_id)
                              var x = {host: msg.author.id, cap1: cap1.id, cap2: cap2.id}
                              rhost.pushHighestElosIntoRoom(x, () => {
                                msg.channel.send("Everyones elo are the same!"+
                                " Captains are now decided by solo queue rank,"+
                                " which is "+cap1+" and "+cap2+"\n"+
                                cap2+ " please pick if you want first or second pick with `.fp` or `.sp`")
                              })
                            } else {
                              var hu = highestUsers.shift()
                              var cap1 = client.users.get(hu.u.discord_id)
                              highestUsers.sort((a,b) => {
                                return  parseFloat(b.u.elo) - parseFloat(a.u.elo)
                              })
                              var cap2 = client.users.get(highestUsers[0].u.discord_id)
                              var x = {host: msg.author.id, cap1: cap1.id, cap2: cap2.id}
                              rhost.pushHighestElosIntoRoom(x, () => {
                                msg.channel.send("There was "+highestUsers.length+" players tied for 2nd highest elo."+
                                " 2nd Captain is now decided by solo queue rank,"+
                                " which is "+cap1+" and "+cap2+"\n"+
                                cap2+ " please pick if you want first or second pick with `.fp` or `.sp`")
                              })
                            }
                          })
                        }, 1000)
                      })
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  })
}
