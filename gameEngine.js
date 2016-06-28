var configs = require('./configs'),
  events = require('./libraries/events').getInstance(),
  log = require('log4js').getLogger('Game Engine'),
  webdriver = require('selenium-webdriver'),
  ActionSequence = webdriver.ActionSequence,
  By = webdriver.By,
  until = webdriver.until,
  Queue = require('queue'),
  RSVP = require('rsvp'),
  wait = require('./utilities/wait');


function GameEngine(nutakuPage, gameConfigs) {
  this.driver = nutakuPage.driver;
  this.configs = gameConfigs;
  this.board = null;
}

GameEngine.prototype.getBoard = function (context) {
  if (context.board != undefined) {
    return context.board;
  } else {
    return context.board = context.driver.findElement(context.queries.board)
  }
}

GameEngine.prototype.configureMode = function (context) {
  var gamePlayModeHandler;

  switch (this.configs.mode) {
    case 'advancement':
      log.info('Trainer is configured for advancement mode. Perpare to clear different levels.');
      // TODO: Implement advancement game play
      gamePlayModeHandler = context.playStatic;
      events.emit('update:trainingMode', 'advancement')
      break;
    case 'static':
    default:
      log.info("Trainer is configured for static mode. No level advancement will take place")
      gamePlayModeHandler = context.playStatic;
      events.emit('update:trainingMode', 'static')
      break;

    case 'daily':
      log.info("Configured to harvest daily rewards only");
      log.warn("Daily trainer not yet implemented");
      gamePlayModeHandler = context.havestDaily;
      events.emit('update:trainingMode', 'daily')
  }
  return gamePlayModeHandler(context);
}

GameEngine.prototype.beginTrainer = function () {
  var configs = this.configs,
    driver = this.driver,
    context = this;

  log.info('Starting %s training', context.type);

  return driver.get(configs.url)
    .then(function () {
      log.debug("looking for game board");
      return context.getBoard(context)
    })
    .catch(function (e) {
      log.error('unable to find game board!', e);
    })
    .then(function () {
      log.debug("Found game board");
    })
    .then(() => wait(5))
    .then(function () {
      return context.startGame(context);
    })
    .then(function () {
      return context.configureMode(context);
    })

}

module.exports = GameEngine;