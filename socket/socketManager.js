var events = require('../libraries/events').getInstance(),
  log = require('log4js').getLogger('SocketManager'),
  io,
  trainer = require('../trainer');

function SocketManager(httpServer) {
  this.server = httpServer;
  this.io = io = require('socket.io')(httpServer);
  log.debug('Setting up connection listeners');
  this.setup();
}

SocketManager.prototype.setup = function setup() {
  io.on('connection', function (socket) {
    console.log('connected')
    socket.emit('welcome')

    socket.on('control:play', () => {
      log.debug("event control play triggered");

      socket.emit('update:text-status', 'Trainer starting..');

      trainer.init();
    });

    socket.on('control:stop', () => {
      log.debug("event control stop triggered");

      socket.emit('update:text-status', 'Stopping trainer..');
    });

    log.debug("setting up application listeners for socket updates")

    events.on('update:text', (newText) => {
      socket.emit('update:text-status', newText);
    });
    events.on('update:gameEngine', (newGameEngine) => {
      socket.emit('update:gameEngine', newGameEngine);
    });
    events.on('update:roundCount', (newRoundCount) => {
      socket.emit('update:roundCount', newRoundCount);
    });
    events.on('update:trainingMode', (newTrainingMode) => {
      socket.emit('update:trainingMode', newTrainingMode);
    });

    events.on('log:debug', function () {
      socket.emit('log:debug', arguments);
    });
    events.on('log:info', function () {
      socket.emit('log:info', arguments);
    });


  });
};

module.exports = SocketManager;