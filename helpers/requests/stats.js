var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  lookupLadder(member, type, callback) {
    rp(`http://${config.db}/slg/league/stats/${type}/${config.season}/${member.id}`)
      .then(data => {
        var ladder = JSON.parse(data)
        callback(ladder)
      })
      .catch(err => {
        console.log(err)
      })
  }
};
