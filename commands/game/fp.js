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
              var room = result.room;
              if (room.blue_team.length == 0 && room.red_team.length == 0 && room.highest_users[1] == msg.author.id) {
                let gName = room.name.split(" ").join("-").toLowerCase()
                rhost.setRoomCaptains(room.host, "fp", () => {
                  rhost.checkRoomName(query_name, result => {
                    dchannel.displayLobby(client, msg, gName, result.room, () => {})
                  })
                })
              }
            }
          })
        }
      })
    }
  })
}
