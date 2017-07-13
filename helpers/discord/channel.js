var rp = require('request-promise');
var ruser = require('../../helpers/requests/user')
var rstats = require('../../helpers/requests/stats')
const config = require("../../config.json");

module.exports = {
  createGameChannels(msg, type, gName, callback) {
    let text_channel = type+"-"+gName
    let voice_channel = type.toUpperCase()+"-"+gName
    createCallback(() =>  {
      setTimeout(() => {
        let tChannel = msg.guild.channels.find("name", text_channel)
        let vChannel = msg.guild.channels.find("name", voice_channel)
        tChannel.overwritePermissions(msg.guild.roles.find("name", "@everyone"), { READ_MESSAGES: false })
        tChannel.overwritePermissions(msg.guild.roles.find("name", "SLG Mod"), { READ_MESSAGES: true })
        tChannel.overwritePermissions(msg.author, { READ_MESSAGES: true })
        vChannel.overwritePermissions(msg.guild.roles.find("name", "@everyone"), { CONNECT: false })
        vChannel.overwritePermissions(msg.guild.roles.find("name", "SLG Mod"), { CONNECT: true })
        vChannel.overwritePermissions(msg.author, { CONNECT: true })

        callback(text_channel)
      }, 1000)
    })
    function createCallback(callback) {
      msg.guild.createChannel(text_channel, "text")
      msg.guild.createChannel(voice_channel, "voice")
      callback()
    }
  },

  deleteGameChannels(guild, type, gName, callback) {
    let text_channel = type+"-"+gName
    let voice_channel = type.toUpperCase()+"-"+gName
    guild.channels.find("name", text_channel).delete()
    guild.channels.find("name", voice_channel).delete()
  },

  joinGameChannel(client, msg, gName, room, callback) {
    let text_channel = room.type+"-"+gName
    let voice_channel = room.type.toUpperCase()+"-"+gName
    msg.guild.channels.find("name", text_channel).overwritePermissions(msg.author, { READ_MESSAGES: true })
    msg.guild.channels.find("name", voice_channel).overwritePermissions(msg.author, { CONNECT: true })
    callback()
  },
  leaveGameChannel(client, msg, gName, room, callback) {
    let text_channel = room.type+"-"+gName
    let voice_channel = room.type.toUpperCase()+"-"+gName
    msg.guild.channels.find("name", text_channel).overwritePermissions(msg.author, { READ_MESSAGES: false })
    msg.guild.channels.find("name", voice_channel).overwritePermissions(msg.author, { CONNECT: false })
    callback()
  },

  displayLobby(client, msg, gName, room, callback) {
    let text_channel = room.type+"-"+gName
    var value = []
    var redTeam = []
    var blueTeam = []
    var red = []
    var blue = []
    var left = []
    displayLobbyCallback(()=> {
      setTimeout(()=> {
        if (room.red_team.length == 0) {
          var content = []
          value.sort((a,b) => {
            return parseFloat(b.rank_elo) - parseFloat(a.rank_elo)
          })
          value.sort((a,b) => {
            return parseFloat(b.slg_elo) - parseFloat(a.slg_elo)
          })
          value.forEach((bar, index) => {
            if (index == 9) {
              content.push((index+1) + ". " + bar.info)
            } else {
              content.push((index+1) + ".  " + bar.info)
            }
          })
          value = "```Python\n"+content.join("").split(",").join("")+"```"
          msg.guild.channels.find("name", text_channel).send(value)
          callback()
        } else {

          value.sort((a,b) => {
            return parseFloat(b.rank_elo) - parseFloat(a.rank_elo)
          })
          value.sort((a,b) => {
            return parseFloat(b.slg_elo) - parseFloat(a.slg_elo)
          })

          blueTeam.sort((a,b) => {
            return a.index - b.index
          })
          redTeam.sort((a,b) => {
            return a.index - b.index
          })
          redTeam.forEach((bar, index) => {
            if (index == 9) {
              red.push((index+1) + ". " + bar.info)
            } else {
              red.push((index+1) + ".  " + bar.info)
            }
          })
          blueTeam.forEach((bar, index) => {
            if (index == 9) {
              blue.push((index+1) + ". " + bar.info)
            } else {
              blue.push((index+1) + ".  " + bar.info)
            }
          })
          value.forEach((bar, index) => {
            if (index == 9) {
              left.push((index+1) + ". " + bar.info)
            } else {
              left.push((index+1) + ".  " + bar.info)
            }
          })
          blue = "**Blue Team**"+"```Python\n"+blue.join("").split(",").join("")+"```"
          red = "**Red Team**"+"```Python\n"+red.join("").split(",").join("")+"```"
          left = "**Remaining**"+"```Python\n"+left.join("").split(",").join("")+"```"
          msg.guild.channels.find("name", text_channel).send(blue)
          msg.guild.channels.find("name", text_channel).send(red)
          if (blueTeam.length != 5) {
            msg.guild.channels.find("name", text_channel).send(left)
            if ((blueTeam.length - redTeam.length) <= 0) {
              let cap = client.users.get(blueTeam[0].id)
              msg.guild.channels.find("name", text_channel).send(cap+" turn to pick")
            } else {
              let cap = client.users.get(redTeam[0].id)
              msg.guild.channels.find("name", text_channel).send(cap+" turn to pick")
            }
          } else {
            msg.guild.channels.find("name", text_channel).send("```Teams have been chosen. You may now start game```")
          }
        }
      }, 1000)
    })

    function displayLobbyCallback(callback2) {
      room.users.forEach(u => {
        ruser.getUser(client.users.get(u), user => {
          rstats.lookupLadder(client.users.get(user.discord_id), room.type, ladder => {
            var rank;
            var username_space = " ".repeat(17 - user.league_name.length);
            var soloq_rank_space = " ".repeat(16 - user.ladder.length);
            var rank_space = " ".repeat(6 - ladder.rank.toString().length);
            var role_space = " ".repeat(15 - user.roles.join(" ").length);

            (ladder.rank == 0) ? rank = "-" : rank = ladder.rank;
            let b = [
              user.league_name, username_space,
              user.ladder, soloq_rank_space,
              user.roles.join(" "), role_space,
              rank, rank_space,
              ladder.elo, "\n",
              "--------------------------------------------------------------\n"].join("").split(",").join("")
            if (room.red_team.includes(user.discord_id)) {
              room.red_team.forEach((z,index) => {
                redTeam.push({
                  index: index+1,
                  id: user.discord_id,
                  rank_elo: user.elo,
                  slg_slo: ladder.elo,
                  info: b
                })
              })
            } else if (room.blue_team.includes(user.discord_id)) {
              room.blue_team.forEach((z,index) => {
                blueTeam.push({
                  index: index+1,
                  id: user.discord_id,
                  rank_elo: user.elo,
                  slg_slo: ladder.elo,
                  info: b
                })
              })
            } else {
              value.push({
                id: user.discord_id,
                rank_elo: user.elo,
                slg_slo: ladder.elo,
                info: b
              })
            }
          })
        })
      })
      callback2()
    }
  },

  createVoiceTeams(gName, room) {
    let blue_voice = "Blue-"+gName
    let red_voice = "Red-"+gName
    createCallback(() =>  {
      setTimeout(() => {
        let blue = msg.guild.channels.find("name", blue_voice)
        let red = msg.guild.channels.find("name", red_voice)

        blue.overwritePermissions(msg.guild.roles.find("name", "@everyone"), { CONNECT: false })
        blue.overwritePermissions(msg.guild.roles.find("name", "SLG Mod"), { CONNECT: true })
        blue.overwritePermissions(msg.author, { CONNECT: true })
        red.overwritePermissions(msg.guild.roles.find("name", "@everyone"), { CONNECT: false })
        red.overwritePermissions(msg.guild.roles.find("name", "SLG Mod"), { CONNECT: true })
        red.overwritePermissions(msg.author, { CONNECT: true })

        for (let userID of room.red_team) {
          let user = msg.guild.members.get(userID)
          red.overwritePermissions(user, { CONNECT: true })
        }
        for (let userID of room.blue_team) {
          let user = msg.guild.members.get(userID)
          blue.overwritePermissions(user, { CONNECT: true })
        }
        callback()
      }, 1000)
    })
    function createCallback(callback) {
      msg.guild.createChannel(blue_voice, "voice")
      msg.guild.createChannel(red_voice, "voice")
      callback()
    }
  }

};
