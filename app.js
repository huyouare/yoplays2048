var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var url = require('url');

app.use(express.static(__dirname + '/public'));

io.configure('production', function(){
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging
  // enable all transports (optional if you want flashsocket)
  io.set('transports', [ 'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});

var port = process.env.PORT || 8000;
server.listen(port);
console.log("Listening at port: " + port);

function gameWin() {
  var request = require('request');

  request.post(
    {url:     "http://api.justyo.co/yoall/",
    form:    { "api_token" : "05f23446-d34c-523e-6c7b-48de0cd8d20c" }
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
}

function gameLose() {
  var request = require('request');

  request.post(
    {url:     "http://api.justyo.co/yoall/",
    form:    { "api_token" : "cb0e12d0-1296-d9d5-d501-b427b086d574" }
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
}

// Routes
app.get('/api', function (req, res) {
  var data = game.getGameData();
  data.highscores = game.getScores();
  data.moveCount = moveCount;
  data.numUsers = nextUserId; // Online users
  data.totalNumUsers = nextUserId; // Visitor count
  res.send(data);
});

app.get('/up', function (req, res) {
  ++nextUserId;
  console.log(nextUserId);

  var user = req.query.username;
  console.log(user);

  socket = {};
  socket.userId = user;

  var direction = 0;
  // Multiplayer
  var spamming = false;
  if (!voted && !spamming) {
    voted = true;
    votes[direction]++;

    // Send the move with the same old game state
    var gameData = game.getGameData();
    var data = {
      direction: direction,
      userId: socket.userId,
      numUsers: nextUserId,
      gameData: gameData,
      highscores: game.getHighscores()
    };
    io.sockets.emit('move', data);

    if (gameData.over) {
      gameLose();
    }
    else if (gameData.won) {
      gameWin();
    }

    if (gameData.over || gameData.won) {
      game.restart(function () {
        var data = game.getGameData();
        data.highscores = game.getHighscores();
        io.sockets.emit('restart', data);
      });
    }
  }
});

app.get('/right', function (req, res) {
  ++nextUserId;

  var user = req.query.username;
  console.log(user);

  socket = {};
  socket.userId = user;

  var direction = 1;
  // Multiplayer
  var spamming = false;
  if (!voted && !spamming) {
    voted = true;
    votes[direction]++;

    // Send the move with the same old game state
    var gameData = game.getGameData();
    var data = {
      direction: direction,
      userId: socket.userId,
      numUsers: nextUserId,
      gameData: gameData
    };
    io.sockets.emit('move', data);

    if (gameData.over) {
      gameLose();
    }
    else if (gameData.won) {
      gameWin();
    }

    if (gameData.over || gameData.won) {
      game.restart(function () {
        var data = game.getGameData();
        data.highscores = game.getHighscores();
        io.sockets.emit('restart', data);
      });
    }
  }
});

app.get('/down', function (req, res) {
  var user = req.query.username;
  console.log(user);

  socket = {};
  socket.userId = user;

  var direction = 2;
  // Multiplayer
  var spamming = false;
  if (!voted && !spamming) {
    voted = true;
    votes[direction]++;

    // Send the move with the same old game state
    var gameData = game.getGameData();
    var data = {
      direction: direction,
      userId: socket.userId,
      numUsers: nextUserId,
      gameData: gameData
    };
    io.sockets.emit('move', data);

    if (gameData.over) {
      gameLose();
    }
    else if (gameData.won) {
      gameWin();
    }

    if (gameData.over || gameData.won) {
      game.restart(function () {
        var data = game.getGameData();
        data.highscores = game.getHighscores();
        io.sockets.emit('restart', data);
      });
    }
  }


});

app.get('/left', function (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var user = req.query.username;
  console.log(user);

  socket = {};
  socket.userId = user;

  var direction = 3;
  // Multiplayer
  var spamming = false;
  if (!voted && !spamming) {
    voted = true;
    votes[direction]++;

    // Send the move with the same old game state
    var gameData = game.getGameData();
    var data = {
      direction: direction,
      userId: socket.userId,
      numUsers: nextUserId,
      gameData: gameData
    };
    io.sockets.emit('move', data);

    if (gameData.over) {
      gameLose();
    }
    else if (gameData.won) {
      gameWin();
    }

    if (gameData.over || gameData.won) {
      game.restart(function () {
        var data = game.getGameData();
        data.highscores = game.getHighscores();
        io.sockets.emit('restart', data);
      });
    }
  }
});

app.get('*', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Setup game
var democracy = true;
var nextUserId = 1732;
var moveCount = 0;
var game = require('./private/js/game');

var voted = false;
var votes = [0, 0, 0, 0]; // for democracy mode
var ids = [];

if (democracy) {
  setInterval(function() {
    var direction = 0;
    for (var i = 1; i < 4; i++) {
      if (votes[i] > votes[direction]) direction = i;
    }
    if (votes[direction] == 0) return;

    // COPIED FROM BELOW
    ++moveCount;
    // update the game
    game.move(direction);

    // Send the move with the game state
    var gameData = game.getGameData();
    var data = {
      direction: direction,
      userId: "Yo",
      numUsers: nextUserId,
      gameData: gameData
    };
    io.sockets.emit('move', data);

    // Reset the game if it is game over or won
    if (gameData.over || gameData.won) {
      game.restart(function () {
        var data = game.getGameData();
        data.highscores = game.getHighscores();
        io.sockets.emit('restart', data);
      });
    }
    // END COPIED

    ids = [];
    votes = [0, 0, 0, 0];
    voted = false;
  }, 1000);
}

io.sockets.on('connection', function (socket) {
  socket.userId = "User " + (nextUserId+1);
  // ++nextUserId;

  // When connecting
  var gameData = game.getGameData();
  var data = {
    userId: socket.userId,
    gameData: gameData,
    numUsers: nextUserId,
    highscores: game.getHighscores()
  };
  socket.emit('connected', data);
  socket.broadcast.emit('someone connected', {
    numUsers: nextUserId
  });

  // When someone moves
  var numMovesPerSecond = 2;
  var pastEvents = [];
  for (var i = 0; i < numMovesPerSecond; i++) {
    pastEvents.push(0);
  }
  // socket.on('move', function (direction) {
  //   if (democracy) {
  //     // Keep track of events
  //     pastEvents.push(new Date().getTime());
  //     pastEvents.splice(0, pastEvents.length - numMovesPerSecond);

  //     // Multiplayer
  //     var spamming = pastEvents[pastEvents.length - 1] - pastEvents[0] < 1000;
  //     if (!voted && !spamming) {
  //       voted = true;
  //       votes[direction]++;

  //       // Send the move with the same old game state
  //       var gameData = game.getGameData();
  //       var data = {
  //         direction: direction,
  //         userId: socket.userId,
  //         numUsers: io.sockets.clients().length,
  //         gameData: gameData
  //       };
  //       io.sockets.emit('move', data);
  //     }
  //   } else {
  //     ++moveCount;
  //     // update the game
  //     game.move(direction);

  //     // Send the move with the game state
  //     var gameData = game.getGameData();
  //     var data = {
  //       direction: direction,
  //       userId: socket.userId,
  //       numUsers: io.sockets.clients().length,
  //       gameData: gameData
  //     };
  //     io.sockets.emit('move', data);

  //     // Reset the game if it is game over or won
  //     if (gameData.over || gameData.won) {
  //       game.restart(function () {
  //         var data = game.getGameData();
  //         data.highscores = game.getHighscores();
  //         io.sockets.emit('restart', data);
  //       });
  //     }
  //   }
  // });

  socket.on('disconnect', function () {
    io.sockets.emit('someone disconnected', {
      numUsers: nextUserId,
    });
  });
});

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (text) {
  console.log(text);
  if (text === 'quit') {
    done();
  }
});

function done() {
  console.log('Now that process.stdin is paused, there is nothing more to do.');
  process.exit();
}
