var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var dchannel = require('../../helpers/discord/channel');
var ractivity = require('../../helpers/requests/activity');

const current_gamemodes = ["solo", "aram"]

exports.run = (client, msg, args) => {
  vuser.isStaff(msg, staff => {
    if (staff) {
      rhost.getRoomByID(msg.author, result => {
        if (!result.success) {
          msg.reply("youre not hosting a game")
        } else {
          let text_channel = result.room.type+"-"+result.room.name.split(" ").join("-").toLowerCase()
          vmessage.checkChannel(msg, [text_channel], channel => {
            if (channel) {
              rhost.checkIfAlreadyHosting(msg.author, result => {
                if (!result.hosted) {
                  msg.reply("Youre not hosting a game! You may host one with `.host`")
                } else {
                  rhost.cancelGame(msg.member, room => {
                    if (room) {
                      for (let user of room.users) {
                        ractivity.end(client.users.get(user), ()=>{})
                      }
                      let gName = room.name.split(" ").join("-").toLowerCase()
                      dchannel.deleteGameChannels(msg.guild, room.type, gName, () => {})
                      msg.reply("Your game `"+room.name+"`, has been canceled")
                    } else {
                      msg.reply("Something went wrong and couldn't cancel game")
                    }
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
