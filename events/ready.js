exports.run = (client) => {
  console.log(`There are ${client.channels.size} channels for a total of ${client.users.size} users.`);
}
