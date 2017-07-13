var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var dchannel = require('../../helpers/discord/channel');
var ractivity = require('../../helpers/requests/activity');
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

exports.run = (client, msg, args) => {
  ractivity.checkActive(msg.author, result => {
    if (result.active) {
      let query_name = result.name.split(" ").join("").toLowerCase()
      let text_channel = result.type+"-"+result.name.split(" ").join("-").toLowerCase()
      vmessage.checkChannel(msg, [text_channel], channel => {
        if (channel) {
          rhost.checkRoomName(query_name, result => {
            if (result.hosted) {
              var room = result.room;
              var a
              var b
              var turn = room.blue_team.length - room.red_team.length
              if (turn == 1) {
                a = room.red_team[0]
                b = room.blue_team[0]
              } else {
                a = room.blue_team[0]
                b = room.red_team[0]
              }
              if (msg.author.id == a) {
                if (turn == 0 && room.blue_team.length == 1) {
                  if (args.length > 1) {
                    msg.reply("only 1 player please")
                  } else {
                    var player = client.users.get(args[0].replace(/\D/g, ''))
                    if (!player) {
                      msg.reply("Couldn't find that user!")
                    } else {
                      if (room.blue_team.includes(player.id) || room.red_team.includes(player.id)) {
                        msg.reply(player+" is already on a team")
                      } else if (!room.users.includes(player.id)) {
                        msg.reply("That user isn't in this game")
                      } else {
                        rhost.pushPlayer(room.host, [player.id], "blue", () => {
                          rhost.checkRoomName(query_name, result => {
                            let gName = result.room.name.split(" ").join("-").toLowerCase()
                            dchannel.displayLobby(client, msg, gName, result.room, ()=>{})
                          })
                        })
                      }
                    }
                  }
                } else if (turn == 0 && room.blue_team.length > 1) {
                  return
                } else {
                  if (args.length != 2) {
                    msg.reply("please pick 2 players at once")
                  } else {
                    var player1 = client.users.get(args[0].replace(/\D/g, ''))
                    var player2 = client.users.get(args[1].replace(/\D/g, ''))
                    if (!player1 || !player2) {
                      msg.reply("Couldn't find one or more of that user")
                    } else {
                      if (room.blue_team.includes(player1.id) || room.red_team.includes(player1.id)) {
                        msg.reply(player1+" is already in a team")
                      } else if (room.blue_team.includes(player2.id) || room.red_team.includes(player2.id)) {
                        msg.reply(player2+" is already in a team")
                      } else if (!room.users.includes(player1.id) || !room.users.includes(player2.id)) {
                        msg.reply("One or more user that you mentioned isn't in this game")
                      } else {
                        if (room.red_team.length == 1) {
                          rhost.pushPlayer(room.host, [player1.id, player2.id], "red", () => {
                            rhost.checkRoomName(query_name, result => {
                              let gName = result.room.name.split(" ").join("-").toLowerCase()
                              dchannel.displayLobby(client, msg, gName, result.room, ()=>{})
                            })
                          })
                        } else if (room.blue_team.length == 2) {
                          rhost.pushPlayer(room.host, [player1.id, player2.id], "blue", () => {
                            rhost.checkRoomName(query_name, result => {
                              let gName = result.room.name.split(" ").join("-").toLowerCase()
                              dchannel.displayLobby(client, msg, gName, result.room, ()=>{})
                            })
                          })
                        } else if (room.red_team.length == 3) {
                          rhost.pushPlayer(room.host, [player1.id, player2.id], "red", () => {
                            rhost.checkRoomName(query_name, result => {
                              room = result.room
                              var t = room.blue_team.concat(room.red_team)
                              var loner = room.users.diff(t)
                              rhost.pushPlayer(room.host, [loner[0]], "blue", () => {
                                rhost.checkRoomName(query_name, result => {
                                  let gName = result.room.name.split(" ").join("-").toLowerCase()
                                  dchannel.displayLobby(client, msg, gName, result.room, ()=>{})
                                  rhost.setGameStart(room.host, ()=>{})
                                  dchannel.createVoiceTeams(gName, result.room)
                                  // rhost.watchGame(room.host, room)
                                })
                              })
                            })
                          })
                        }
                      }
                    }
                  }
                }
              }
            }
          })
        }
      })
    }
  })
}
