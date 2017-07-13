var rp = require('request-promise');
const config = require("../../config.json");
var rriot = require('./riot')
var rstats = require('./stats')
var rbank = require('./bank')
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
  isSignedUp(msg, name, callback) {
    var sum, sum2
    rp(`http://${config.db}/slg/users/`)
      .then(data => {
        let users = JSON.parse(data).users
        function signupCallback(cb) {
          for (let user of users) {
            if (user.discord_id == msg.author.id) {
              sum = user.league_name;
            }
            if (user.query_name == name) {
              sum2 = user.league_name;
            }
          }
          cb()
        }
        if (users != 0) {
          signupCallback(() =>{
            callback(sum, sum2)
          })
        } else {
          callback(sum, sum2)
        }
      })
      .catch(err => {
        console.log("Error at /requests user.isSignedUp():\nCouldn't retrive users: "+err)
      })
  },
  createUser(msg, token, callback) {
    rriot.checkLadder(msg, token.summoner_id, ladder => {
      if (ladder == null) {
        var elo = 0;
        var ladder = "Unranked";
      } else {
        var elo = ladder.elo;
        var ladder = ladder.ladder
      }
      let options = {
        method: "POST",
        uri:`http://${config.db}/slg/users/new`,
        body: {
          discord_id: token.discord_id,
          summoner_id: token.summoner_id,
          account_id: token.account_id,
          query_name: token.query_name,
          league_name: token.league_name,
          elo: elo,
          ladder: ladder
        },
        json: true
      }
      rp(options)
        .then(data => {
          let bank = {
            method: "POST",
            uri: `http://${config.db}/slg/bank/new`,
            body: { discord_id: token.discord_id },
            json: true
          }
          let solo = {
            method: "POST",
            uri: `http://${config.db}/slg/league/stats/solo/new`,
            body: { discord_id: token.discord_id },
            json: true
          }
          let aram = {
            method: "POST",
            uri: `http://${config.db}/slg/league/stats/aram/new`,
            body: { discord_id: token.discord_id },
            json: true
          }
          rp(bank).then(data=>{}).catch(err=>{console.log(err)})
          rp(solo).then(data=>{}).catch(err=>{console.log(err)})
          rp(aram).then(data=>{}).catch(err=>{console.log(err)})
          callback(data.user)
        })
        .catch(err => {
          console.log("Couldn't create user: "+err)
        })
    })
  },
  removeRoleTags(msg, callback) {
    var acceptedRoles = ["Fill", "Top", "Mid", "Adc", "Jungle", "Support"]
    for (let role of acceptedRoles) {
      let a = msg.guild.roles.find("name", role)
      if (a) {
        msg.member.removeRole(a).catch(console.error);
      }
    }
    let options = {
      method: "DELETE",
      uri: `http://${config.db}/slg/users/delete_roles/${msg.author.id}`
    }
    rp(options)
      .then(()=>{})
      .catch(err => {
        console.log("Couldn't delete roles")
      })
    callback()
  },
  addTag(msg, role) {
    let a = msg.guild.roles.find("name", role)
    msg.member.addRole(a).catch(console.error)
    var acceptedRoles = ["Fill", "Top", "Mid", "Adc", "Jungle", "Support"]
    if (acceptedRoles.includes(role)) {
      let options = {
        method: "PATCH",
        uri: `http://${config.db}/slg/users/push_role/${msg.author.id}/${role}`
      }
      rp(options)
        .then(()=>{})
        .catch(err => {
          console.log("Couldn't add role")
        })
    }
  },
  lookupStats(member, summoner_id, next) {
    var stats = []
    this.updateUser(member, summoner_id, user => {
      stats.push(user)
      rstats.lookupLadder(member, "solo", solo => {
        stats.push(solo)
        rstats.lookupLadder(member, "aram", aram => {
          stats.push(aram)
          rbank.lookupBank(member, bank => {
            stats.push(bank)
            next(stats)
          })
        })
      })
    })
  },
  updateUser(member, summoner_id, callback) {
    rriot.checkLadder(member, summoner_id, ladder => {
      if (!ladder) {
        var elo = 0;
        var solo_ladder = "Unranked"
      } else {
        var elo = ladder.elo;
        var solo_ladder = ladder.ladder;
      }
      rriot.checkSummonerName(member, ladder.query_name, summoner => {
        let options = {
          method: "PATCH",
          uri:`http://${config.db}/slg/users/update`,
          body: {
            discord_id: member.id,
            query_name: summoner.query_name,
            league_name: summoner.name,
            elo: elo,
            ladder: solo_ladder
          },
          json: true
        }
        rp(options)
          .then(data => {
            rp(`http://${config.db}/slg/users/${member.id}`)
              .then(data => {
                user = JSON.parse(data).user
                callback(user)
              })
              .catch(err => {console.log(err)})
          })
          .catch(err => {console.log(err)})
      })
    })
  },
  getUser(member, next) {
    rp(`http://${config.db}/slg/users/${member.id}`)
      .then(data => {
        var user = JSON.parse(data).user
        next(user)
      })
      .catch(err => {console.log(err)})
  }
}
