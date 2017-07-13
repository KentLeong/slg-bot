const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
  });
});

client.on("message", msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(config.prefix)) return;
  if (msg.channel.type == "dm") return;

  const args = msg.content.split(" ");
  const command = args.shift().slice(config.prefix.length);
  for (let commandType of config.commands) {
    let cmdType = Object.keys(commandType).toString()
    let cmdTypeValues = commandType[cmdType]
    if (cmdTypeValues.includes(command)) {
      try {
        let commandFile = require(`./commands/${cmdType}/${command}.js`);
        commandFile.run(client, msg, args);
      } catch (err) {
        console.error(err);
      }
    }
  }
});

client.login(config.token);
