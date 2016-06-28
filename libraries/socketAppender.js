"use strict";
var layouts = require('log4js').layouts,
  // consoleLog = console.log.bind(console),
  events = require('./events').getInstance();

function socketAppender(layout, timezoneOffset) {
  layout = layout || layouts.colouredLayout;
  return function (loggingEvent) {
    var level = loggingEvent.level.levelStr.toLowerCase().trim();
    events.emit('log:' + level, loggingEvent.data);
  };
}

function configure(config) {
  var layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return socketAppender(layout, config.timezoneOffset);
}



exports.appender = socketAppender;
exports.configure = configure;