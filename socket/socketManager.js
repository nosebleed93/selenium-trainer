var EventEmitter = require('events'),
    events = new EventEmitter(),
    log = require('log4js').getLogger('SocketManager'),
    io,
    trainer = require('../trainer');

function SocketManager(httpServer){
  this.server = httpServer;
  this.io = io = require('socket.io')(httpServer);
  log.debug('Setting up connection listeners');
  this.setup();
}

SocketManager.prototype.setup = function setup(){
  io.on('connection', function(socket){
    console.log('connected')
    socket.emit('welcome')
    
    socket.on('control:play', function(){
      log.debug("event control play triggered");

      socket.emit('update:text-status', 'Trainer starting..');

      trainer.init();
    });

    socket.on('control:stop', function(){
      log.debug("event control stop triggered");

      socket.emit('update:text-status', 'Stopping trainer..');
    });

    events.on('update:text', function(newText){
      log.debug("broadcasting update:text with: ", newText);
      socket.emit('update:text-status', newText);
    });

    events.on('log:debug', function(){
      log.debug("broadcasting log:debug with: ", JSON.stringify(arguments));
      socket.emit('log:debug', arguments);
    });
    events.on('log:info', function(){
      log.debug("broadcasting log:info with: ", JSON.stringify(arguments));
      socket.emit('log:info', arguments);
    });


  });
};

events.on('log:debug', function(){
      log.debug("broadcasting log:debug with: ", JSON.stringify(arguments));
      socket.emit('log:debug', arguments);
    });

module.exports = SocketManager;