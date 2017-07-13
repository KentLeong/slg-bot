var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  generateToken(msg, summoner, callback) {
    var token = Math.floor(Math.random() * 1000000000)
    var options = {
      method: "POST",
      uri: `http://${config.db}/slg/tokens/new`,
      body: {
        "discord_id": msg.author.id,
        "league_name": summoner.name,
        "account_id": summoner.account_id,
        "summoner_id": summoner.summoner_id,
        "query_name": summoner.query_name,
        "user_token": token
      },
      json: true
    }
    rp(options)
      .then(() => {
        callback(token)
      })
      .catch(err => {
        console.log("Error at tokenRequest.generateToken().\nCouldn't generate token: "+err)
      })
  },
  getTokens(msg, callback) {
    rp(`http://${config.db}/slg/tokens/`)
      .then(data => {
        let tokens = JSON.parse(data).tokens
        callback(tokens)
      })
      .catch(err => {
        console.log("Couldn't retive tokens: "+err)
      })
  },
  hasToken(msg, callback) {
    // GET all tokens
    this.getTokens(msg, tokens => {
      var tokenFound = false
      function hasTokenCB(cb) {
        for (let token of tokens) {
          if (token.discord_id == msg.author.id) {
            tokenFound = true
            callback(token)
          }
        }
        cb()
      }
      hasTokenCB(() => {
        if (tokenFound == false) {
          callback(false)
        }
      })
    })
  },
  deleteToken(msg, callback) {
    var options = {
      method: "DELETE",
      uri: `http://${config.db}/slg/tokens/${msg.author.id}`
    }
    rp(options)
      .then(() => {
        callback()
      })
      .catch((err) => {
        console.log(err)
      })
  },
  deleteAllTokens(msg) {
    var options = {
      method: "DELETE",
      uri: `http://${config.db}/slg/tokens`
    }
    rp(options)
      .then(() => {
      })
      .catch((err) => {
        console.log("couldnt not delete token: "+err);});
  }
};
