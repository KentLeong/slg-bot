const vuser = require('../../helpers/validations/user');
const ruser = require('../../helpers/requests/user');
const vmessage = require('../../helpers/validations/message');
const config = require('../../config.json')
exports.run = (client, msg, args) => {
  let next
  vmessage.checkChannel(msg, ["bot-commands", "general"], channel => {next=channel})
  if (!next) {return}
  vuser.isUser(msg, user => {next=user})
  if (!next) {return}

  vmessage.getMentions(msg, 2, mentions => {
    if (mentions.length == 2) {
      ruser.getUser(mentions[0], user1 => {
        ruser.getUser(mentions[1], user2 => {
          msg.channel.send("Comparing "+mentions[0]+" and "+mentions[1])
          setTimeout(() => {
            msg.reply("This command is not yet available. Please try again later.")
          }, 2000)
        })
      })
    } else {
      var summoner_id
      if (mentions.length == 1) {
        var user = mentions[0];
      } else {
        var user = msg.author
      }
      ruser.getUser(user, summoner => {

        ruser.lookupStats(user, summoner.summoner_id, stats => {
          let user = stats[0]
          let solo = stats[1]
          let aram = stats[2]
          let bank = stats[3]
          var roles
          var solo_rank
          var aram_rank
          if (user.roles.length == 1) {
            roles = user.roles[0]
          } else {
            roles = user.roles[0] + " and "+user.roles[1]
          }
          if (solo.rank == 0) {
            solo_rank = "unranked"
          } else {
            solo_rank = solo.elo.toString() + " (#"+solo.rank+")"
          }
          if (aram.rank == 0) {
            aram_rank = "unranked"
          } else {
            aram_rank = aram.elo.toString() + " (#"+aram.rank+")"
          }
          msg.channel.sendEmbed({
            color: 3447003,
            fields: [{
              name: "Solo League Gaming",
              value: "```Markdown\n"+
                     `Summoner: ${user.league_name}\n`+
                     `Ladder: ${user.ladder}\n`+
                     `Roles: ${roles}\n`+
                     `Coins: ${bank.coins}\n`+
                     "\n"+
                     "SOLO\n"+
                     `Rank: ${solo_rank}\n`+
                     `Win/Loss: ${solo.wins}/${solo.loses}\n`+
                     `KDA: ${solo.kda}  ${solo.kills}/${solo.deaths}/${solo.assists}\n`+
                     "\n"+
                     "ARAM\n"+
                     `Rank: ${aram_rank}\n`+
                     `Win/Loss: ${aram.wins}/${aram.loses}\n`+
                     `KDA: ${aram.kda}  ${aram.kills}/${aram.deaths}/${aram.assists}\n`+
                     "```"
            }],
              timestamp: new Date(),
              footer: {
                text: "Current season: "+config.season+" "
              }
          })
        })
      })

    }
  })
};
