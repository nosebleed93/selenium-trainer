var EventEmitter = require('events'),
    events = new EventEmitter(),
    log4js = require('log4js');

function Logger(namespace){
  this.namespace = namespace;
  this.log = log4js.getLogger(namespace);
};

Logger.prototype.debug = function debug(){
  events.emit('log:debug', arguments);
  this.log.debug.apply(this.log, arguments);
}

Logger.prototype.info = function info(){
  events.emit('log:info', arguments);
  this.log.info.apply(this.log, arguments);
}

Logger.prototype.warn = function warn(){
  events.emit('log:warn', arguments);
  this.log.warn.apply(this.log, arguments);
}

Logger.prototype.error = function error(){
  events.emit('log:error', arguments);
  this.log.error.apply(this.log, arguments);
}

module.exports = Logger;