var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  create(member, type, action, name, callback) {
    var options = {
      method: "POST",
      uri: `http://${config.db}/slg/activities/new`,
      body: {
        discord_id: member.id,
        type: type,
        action: action,
        name: name
      },
      json: true
    }
    rp(options)
      .then(data=>{callback(true)})
      .catch(err=> {callback(false)})
  },
  end(member, callback) {
    rp({method:"PATCH", uri: `http://${config.db}/slg/activities/${member.id}/end`})
      .then(data=> {callback(true)})
      .catch(err=> {callback(false)})
  },
  checkActive(member, callback) {
    rp(`http://${config.db}/slg/activities/${member.id}/check`)
      .then(data => {
        var activity = JSON.parse(data)
        if (activity) {
          var a = {
            active: true,
            action: activity.action,
            type: activity.type,
            name: activity.name
          }
          callback(a)
        } else {
          callback({active: false})
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
};
