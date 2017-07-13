var rp = require('request-promise');
const config = require("../../config.json");
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
var rhost = require('../../helpers/requests/host');
var ractivity = require('../../helpers/requests/activity');

const acceptedCommands = ["solo", "aram"]

exports.run = (client, msg, args) => {
  let next
  vmessage.checkChannel(msg, ["slg", "bot-commands", "general"], channel => {next=channel})
  if (!next) {return}
  vuser.isUser(msg, user => {
    if (user) {
      if (args.length == 0) {
        msg.reply("must enter a command for example, `.game solo`")
      } else {
        var command = args.shift()
        if (!acceptedCommands.includes(command)) {
          msg.reply("`"+command+"` is an invalid command")
        } else {
        if (command == "solo" || command == "aram") {
          rhost.getLeagueRoomsByType(command, rooms => {
            if (rooms) {
              var ingames = []
              var drafts = []
              var lobbies = []
              var s = "s"
              roomCallback(()=> {
                var b = ""
                var c = ""
                var d = ""
                var a = "`"+rooms.length+"` active `"+command+"` game"+s+". "
                if (ingames.length > 0) {b = "`"+ingames.length + "` in game. "}
                if (drafts.length > 0) {c = "`"+drafts.length + "` in draft phase. "}
                if (lobbies.length > 0) {d = "`"+lobbies.length + "` in lobby."}
                msg.reply(a+b+c+d)
                for (let lobby of lobbies) {
                  let host = client.users.get(lobby.host)
                  msg.channel.sendEmbed({
                    color: 3447003,
                    fields: [{
                      name: "Solo League Gaming",
                      value: "```Markdown\n"+
                             `Type: ${lobby.type}\n`+
                             `Host: ${host.username}\n`+
                             `Name: ${lobby.name}\n`+
                             `Players: ${lobby.users.length}\n`+
                             `Minimum Rank: Gold V`+
                             "```"
                    }],
                    footer: {
                      text: "Current season "+config.season
                    }
                  })
                }
              })
              function roomCallback(callback) {
                if (rooms.length == 1) {s = ""}
                for (let room of rooms) {
                  if (room.game_start) {
                    ingames.push(room)
                  } else if (room.select_start) {
                    drafts.push(room)
                  } else {
                    lobbies.push(room)
                  }
                }
                callback()
              }
            } else {
              msg.reply("There are currently no "+command+" games")
            }
          })
        }
      }
    }
  }
})
}
