"use strict";
var layouts = require('log4js').layouts,
    // consoleLog = console.log.bind(console),
    EventEmitter = require('events'),
    events = new EventEmitter()

function socketAppender (layout, timezoneOffset) {
  layout = layout || layouts.colouredLayout;
  return function(loggingEvent) {
    var level = loggingEvent.level.levelStr.toLowerCase().trim();
    console.log('log:'+ level)
    events.emit('log:' + level, loggingEvent.data);
    // consoleLog(layout(loggingEvent, timezoneOffset));
  };
}

function configure(config) {
  var layout;
  if (config.layout) {
    // layout = layouts.layout(config.layout.type, config.layout);
  }
  return socketAppender(layout, config.timezoneOffset);
}



exports.appender = socketAppender;
exports.configure = configure;