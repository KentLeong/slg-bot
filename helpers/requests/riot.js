var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  checkSummonerName(msg, name, callback) {
    rp(`http://${config.db}/riot/summoner/na1/${encodeURI(name)}`)
      .then(result => {
        let data = JSON.parse(result)
        let summoner = {
          "name": data.name,
          "account_id": data.account_id,
          "summoner_id": data.summoner_id,
          "query_name": name,
          "found": true
        }
        callback(summoner)
      })
      .catch(err => {
        console.log(err)
      })
  },
  checkRunes(msg, token, callback) {
    rp(`http://${config.db}/riot/summoner/runes/na1/${token.summoner_id}`)
      .then(result => {
        let pages = JSON.parse(result).pages
        if (pages.includes(token.user_token)) {
          callback(token);
        } else {
          callback(false);
        }
      })
      .catch(err => {
        console.log("Couldn't retrieve runepage: "+err)
      })
  },
  checkLadder(msg, summoner_id, callback) {
    rp(`http://${config.db}/riot/summoner/ladders/na1/${summoner_id}`)
      .then(result => {

        let ladders = JSON.parse(result).ladders
        if (ladders == null) {
          callback(ladders)
        } else {
          callback(ladders.ladder_solo)
        }
      })
      .catch(err => {
        console.log("Couldn't get summoner ladder: "+err)
      })
  },
  specGame(msg, summoner_id, callback) {
    rp(`http://${config.db}/riot/match/na1/spectate/${summoner_id}`)
      .then(result => {
        let game = JSON.parse(result)
        callback(game)
      })
      .catch(err => {
        callback(false)
      })
  }
};
