var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ruser = require('../../helpers/requests/user')
var dchannel = require('../../helpers/discord/channel');
var ractivity = require('../../helpers/requests/activity');

exports.run = (client, msg, args) => {
  vuser.isUser(msg, isUser => {
    if (isUser) {
      if (args.length == 0) {
        ractivity.checkActive(msg.author, result => {
          if (result.active) {
            var text_channel = result.type+"-"+result.name.split(" ").join("-").toLowerCase()
            var gName = result.name.split(" ").join("-").toLowerCase()
            var roomName = result.name.split(" ").join("").toLowerCase()
            vmessage.checkChannel(msg, [text_channel], isChannel => {
              if (isChannel) {
                rhost.checkRoomName(roomName, result => {
                  if (result.hosted) {
                    dchannel.displayLobby(client, msg, gName, result.room, lobby => {})
                  }
                })
              }
            })
          }
        })
      }
    }
  })
};
