var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ruser = require('../../helpers/requests/user');
var dchannel = require('../../helpers/discord/channel');
var ractivity = require('../../helpers/requests/activity');

exports.run = (client, msg, args) => {
  ractivity.checkActive(msg.author, result => {
    if (result.active) {
      let query_name = result.name.split(" ").join("").toLowerCase()
      let text_channel = result.type+"-"+result.name.split(" ").join("-").toLowerCase()
      vmessage.checkChannel(msg, [text_channel], channel => {
        if (channel) {
          rhost.checkRoomName(query_name, result => {
            if (result.hosted) {
              var room = result.room
              if (msg.author.id != room.host) {
                msg.reply("youre not the host of this game")
              } else {
                rhost.startSpec("26503645", found => {
                  if (found) {
                    msg.guild.channels.find("name", text_channel).send("```successfully found game```")
                  } else {
                    msg.guild.channels.find("name", text_channel).send("```failed to find game```")
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
