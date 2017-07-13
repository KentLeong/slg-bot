 var rp = require('request-promise');
const config = require("../../config.json");

module.exports = {
  getRoomByID(member, callback) {
    rp(`http://${config.db}/slg/league/rooms/${member.id}/discord_id`)
      .then(data => {
        let room = JSON.parse(data)
        callback({success: true, room: room})
      })
      .catch(err => {
        callback({success: false})
        console.log(err)
      })
  },
  newRoom(member, type, roomName, callback) {
    var options = {
      method: "POST",
      uri: `http://${config.db}/slg/league/rooms/new`,
      body: {
        host: member.id,
        name: roomName,
        query_name: roomName.split(" ").join("").toLowerCase(),
        type: type
      },
      json: true
    }
    rp(options)
      .then(room => {
        callback(room)
      })
      .catch(err => {
        callback(false)
        console.log(err)
      })
  },
  getRooms(callback) {
    rp(`http://${config.db}/slg/league/rooms`)
      .then(data => {
        var rooms = JSON.parse(data)
        callback(rooms)
      })
      .catch(err => {
        callback(false)
        console.log(err)
      })
  },
  checkRoomName(roomName, callback) {
    rp(`http://${config.db}/slg/league/rooms/${roomName}/check_name`)
      .then(data => {
        var room = JSON.parse(data)
        var a = {
          hosted: true,
          room: room
        }
        if (room) {
          callback(a)
        } else {
          callback({hosted: false})
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  checkIfAlreadyHosting(member, callback) {
    rp(`http://${config.db}/slg/league/rooms/${member.id}/check`)
      .then(data => {
        var room = JSON.parse(data)
        var a = {
          hosted: true,
          name: room.name
        }
        if (room) {
          callback(a)
        } else {
          callback({hosted: false})
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  cancelGame(member, callback) {
    rp({method: "PATCH", uri:`http://${config.db}/slg/league/rooms/${member.id}/cancel`})
      .then(result => {
        var room = JSON.parse(result)
        callback(room)
      })
      .catch(err => {
        console.log(err)
        callback(false)
      })
  },
  joinRoom(member, query_name, callback) {
    var options = {
      method: "PATCH",
      uri: `http://${config.db}/slg/league/rooms/${member.id}/join/${query_name}`
    }
    rp(options)
      .then(data => {
        var result = JSON.parse(data)
        if (!result) {
          callback({success: false})
        } else if (result == "full") {
          callback({success: false, full: true})
        } else {
          var a = {
            success: true,
            room: result.room,
            remaining: result.remaining
          }
          callback(a)
        }
      })
      .catch(err=> {
        console.log(err)
      })
  },
  leaveRoom(member, query_name, callback) {
    var options = {
      method: "PATCH",
      uri: `http://${config.db}/slg/league/rooms/${member.id}/leave/${query_name}`
    }
    rp(options)
      .then(data => {
        var result = JSON.parse(data)
        if (!result) {
          callback({success: false})
        } else {
          callback({success: true})
        }
      })
      .catch(err=> {
        console.log(err)
      })
  },
  getLeagueRoomsByType(type, callback) {
    rp(`http://${config.db}/slg/league/rooms/${type}`)
      .then(data => {
        var rooms = JSON.parse(data)
        callback(rooms)
      })
      .catch(err => {
        console.log(err)
      })
  },
  pushHighestElosIntoRoom(a, callback) {
    var options = {
      method: "PATCH",
      uri: `http://${config.db}/slg/league/rooms/push_highest`,
      body: {
        host: a.host,
        cap1: a.cap1,
        cap2: a.cap2
      },
      json: true
    }
    rp(options)
      .then(result => {callback()})
      .catch(err => {console.log(err)})
  },
  setRoomCaptains(host, pick, callback) {
    var options = {
      method: "PATCH",
      uri: `http://${config.db}/slg/league/rooms/pick_order`,
      body: {
        host: host,
        pick: pick
      },
      json: true
    }
    rp(options)
      .then(result => {callback()})
      .catch(err => {console.log(err)})
  },
  pushPlayer(host, players, team, callback) {
    var options = {
      method: "PATCH",
      uri: `http://${config.db}/slg/league/rooms/push_player`,
      body: {
        host: host,
        players: players,
        team: team
      },
      json: true
    }
    rp(options)
      .then(data => {callback()})
      .catch(err => {console.log(err)})
  },
  watchGame(host, room) {
    var spec = setInterval(()=> {
      rp(`http://${config.db}/slg/riot/na1/spectate/${host}`)
        .then(data => {
          var game = JSON.parse(data)
          var gameFound = false
          if (gameFound) {
            clearInterval(spec)
          }
        })
        .catch(err => {
          console.log("couldn't find game.")
        })
    }, 300000)
  },
  setGameStart(host, callback) {
    var options = {
      method: "PATCH",
      uri: `http://${config.db}/slg/league/rooms/set_start`,
      body: {
        host: host
      },
      json: true
    }
    rp(options)
      .then(data => {callback()})
      .catch(err => {console.log(err)})
  },
  startSpec(host, callback) {
    rp(`http://${config.db}/riot/match/na1/spectate/${host}`)
      .then(data => {
        var game = JSON.parse(data)
        var options = {
          method: "POST",
          uri: `http://${config.db}/slg/league/rooms/create_game`,
          body: {
            host: host,
            gameID: game.gameId,
            participants: game.participants,
            bannedChampions: game.bannedChampions,
            gameStart: game.gameStartTime
          },
          json: true
        }
        rp(options)
          .then(data => {
            callback(true)
          })
          .catch(err => {
            callback(false)
            console.log(err)
          })
      })
      .catch(err => {
        callback(false)
        console.log(err)
      })
  },
  gameFinished(gameID) {
    rp(`http://${config.db}/riot/match/na1/detail/${gameID}`)
      .then(data => {
        var game = JSON.parse(data)
        var options = {
          method: "PATCH",
          uri: `http://${config.db}/slg/league/rooms/create_game`,
          body: {
            host: host,
            gameID: game.gameId,
            participants: game.participants,
            bannedChampions: game.bannedChampions,
            gameStart: game.gameStartTime
          },
          json: true
        }
        rp(options)
          .then(data => {
            callback(true)
          })
          .catch(err => {
            callback(false)
            console.log(err)
          })
      })
      .catch(err => {
        callback(false)
        console.log(err)
      })
  }
};
