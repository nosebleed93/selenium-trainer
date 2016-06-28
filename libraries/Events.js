"use strict"
var EventEmitter = require('events'),
  instance;

class Events extends EventEmitter {}

Events.getInstance = function(){
  if(!instance){
    instance = new Events();
  }

  return instance;
}

module.exports = Events;