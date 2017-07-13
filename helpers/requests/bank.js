var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  lookupBank(member, callback) {
    rp(`http://${config.db}/slg/bank/${config.season}/${member.id}`)
      .then(data => {
        var bank = JSON.parse(data)
        callback(bank)
      })
      .catch(err => {
        console.log(err)
      })
  }
};
