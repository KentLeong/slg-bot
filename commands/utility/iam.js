var ruser = require('../../helpers/requests/user');
var vuser = require('../../helpers/validations/user');
var vmessage = require('../../helpers/validations/message');
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

exports.run = (client, msg, args) => {
  // msg.reply("hi")
  // let next
  // vuser.isUser(msg, user => {next=user})
  // if (!next) {return}
  // vmessage.checkChannel(msg, ["bot-commands"], channel => {next=channel})
  // if (!next) {return}

  var acceptedRoles = ["Fill", "Top", "Mid", "Adc", "Jungle", "Support"]
  if (args.length > 2) {
    msg.reply("You are allowed up to 2 roles.")
  } else if (args.length == 0) {
    msg.reply("no role specified")
  } else {
    var valid = true;
    var roles = [];
    for (let role of args) {
      let fRole = role.toLowerCase().capitalize()
      if (!acceptedRoles.includes(fRole)) {
        valid = false
      }
      roles.push(fRole)
    }
    if (!valid) {
      msg.reply("Thats not a role. Please choose up to two roles from `Fill Top Mid Adc Jungle Support`")
    } else {
      if (roles.length == 1) {
        ruser.removeRoleTags(msg, () => {
          msg.reply("You are now a `"+roles[0]+"` main.")
          setTimeout(()=>{
            ruser.addTag(msg, roles[0])
          }, 500);
        })
      } else {
        if (roles[0] == roles[1]) {
          ruser.removeRoleTags(msg, () => {
            msg.reply("You must really like `"+roles[0]+"`! kys")
            setTimeout(()=>{
              ruser.addTag(msg, roles[0])
            }, 500);
          })
        } else {
          ruser.removeRoleTags(msg, () => {
            for (let role of roles) {
              setTimeout(()=>{
                ruser.addTag(msg, role)
              }, 500);
            }
            msg.reply("You are now a `"+roles[0]+"` and `"+roles[1]+"` main.")
          })
        }
      }
    }
  }
};
