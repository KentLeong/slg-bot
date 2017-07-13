var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ruser = require('../../helpers/requests/user')
var dchannel = require('../../helpers/discord/channel');
var ractivity = require('../../helpers/requests/activity');

exports.run = (client, msg, args) => {
  let next
  vmessage.checkChannel(msg, ["slg"], channel => {next=channel})
  if (!next) {return}
  vuser.isUser(msg, isUser => {
    if (isUser) {
      ractivity.checkActive(msg.author, result => {
        if (result.active) {
          msg.reply("You already "+result.action+"ed a `"+result.type+"` called `"+result.name+"`.\n"+
          "Please make sure you finish this game before you join another or type `.leave`")
        } else {
          var query_name = args.join("").toLowerCase()
          rhost.joinRoom(msg.author, query_name, result => {
            if (result.success) {
              let gName = result.room.name.split(" ").join("-").toLowerCase()
              dchannel.joinGameChannel(client, msg, gName, result.room, () => {
                ruser.getUser(msg.author, user => {
                  ractivity.create(msg.author, result.room.type, "join", result.room.name, () => {})
                  var text_channel = result.room.type+"-"+result.room.name.split(" ").join("-").toLowerCase()
                  if (result.remaining == 0) {
                    msg.guild.channels.find("name", text_channel).send("```"+user.league_name+" joined the lobby\nLobby full, you may now start```")
                    msg.guild.channels.find("name", text_channel).send(client.users.get(result.room.host))
                  } else {
                    msg.guild.channels.find("name", text_channel).send("```"+user.league_name+" joined the lobby```")
                  }
                  dchannel.displayLobby(client, msg, gName, result.room, ()=>{})
                })
              })
            } else if (result.full){
              msg.reply("Sorry, that game is full. Please join another game or wait for the next one")
            } else {
              msg.reply("Something went wrong or that game does not exist")
            }
          })
        }
      })
    }
  })
};
