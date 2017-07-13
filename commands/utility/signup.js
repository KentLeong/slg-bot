var rp = require('request-promise');
const config = require("../../config.json");
var rtoken = require('../../helpers/requests/token');
var ruser = require('../../helpers/requests/user');
var rriot = require('../../helpers/requests/riot');
var vmessage = require('../../helpers/validations/message');
exports.run = (client, msg, args) => {
  let next
  vmessage.checkChannel(msg, ["bot-commands"], channel => {next=channel})
  if (!next) {return}

  var name
  if (args) {
    name = args.join('').toString();
  }
  if (name.length < 2) {
    msg.reply("Please enter a valid summoner name.")
  } else if (name.length > 16) {
    msg.reply("Summoner names are not more than 16 characters.")
  } else {
    //checks if author is signed up and if summoner name is taken
    //sum checks if author is signed up
    //sum2 checks if name is already in use
    ruser.isSignedUp(msg, name, (sum, sum2) => {
      if (sum) {
        msg.reply("You are already signed up with "+ "`"+sum+"`")
      } else if (sum2) {
        msg.reply("`"+sum2+"`"+" is binded to another person on the  discord already.")
      } else {
        rriot.checkSummonerName(msg, name, summoner => {
          rtoken.hasToken(msg, result => {
            if (result) {
              rtoken.deleteToken(msg, () => {
                rtoken.generateToken(msg, summoner, token => {
                  msg.reply("Your previous token has been deleted, and a new one has been generated. Please rename any one of your rune pages to "+"`"+token+"`"+
                            "\nAfter you have saved, please type "+"`.verify`")
                })
              });
            } else {
              rtoken.generateToken(msg, summoner, token => {
                msg.reply("A token has been generated. Please rename any one of your rune pages to "+"`"+token+"`"+
                          "\nAfter you have saved, please type "+"`.verify`")
              });
            }
          })
        })
      }
    });
  }
}
