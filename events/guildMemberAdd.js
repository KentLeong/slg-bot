var ruser = require('../helpers/requests/user');
var rp = require('request-promise');
const config = require("../config.json");
exports.run = (client, member) => {
  let guild = member.guild;
  rp(`http://${config.db}/slg/users/`)
    .then(data => {
      var user_found = false
      let users = JSON.parse(data).users

      function signupCallback(callback1) {
        for (let user of users) {
          if (user.discord_id == member.user.id) {
            user_found = true
            var tags = []
            member.setNickname(user.league_name)
            member.send(`Welcome back to slg ${member.user}, I have restored all your tags and stats`).catch(console.error);
            function tagCallback(callback2) {
              tags.push(guild.roles.find("name", user.ladder))
              for (let role of user.roles) {
                tags.push(guild.roles.find("name", role))
              }
              callback2()
            }
            tagCallback(()=> {
              for (let tag of tags) {
                member.addRole(tag).catch(console.error)
              }
            })
          }
        }
        callback1()
      }

      signupCallback(()=> {
        if (user_found == false) {
          member.send(`Welcome ${member.user} to slg, I see that its your first time here, please run the command \`.signup\` with your league name to get started.`).catch(console.error);
          member.setNickname("Not-Signed-Up")
        }
      })
    })
    .catch(err => {
      console.log(err)
    })
}
