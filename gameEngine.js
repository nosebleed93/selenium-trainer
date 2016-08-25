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
  this.url = "not implemented";
}

GameEngine.prototype.beginTrainer = function () {
  var configs = this.configs,
    driver = this.driver,
    context = this;

  log.info('Starting %s training', context.type);

  return driver.get(context.url)
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
    .then(() => wait(7))
    .then(function () {
      return context.startGame(context);
    })
    .then(function () {
      return context.configureMode(context);
    })

}

GameEngine.prototype.configureMode = function (context) {
  var gamePlayModeHandler;

  switch (this.configs.mode) {
    case 'advancement':
      log.info('Trainer is configured for advancement mode. Perpare to clear different levels.');
      // TODO: Implement advancement game play
      gamePlayModeHandler = context.playAdvance;
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
      gamePlayModeHandler = context.havestDaily;
      events.emit('update:trainingMode', 'daily');
      break;

    case 'selloff':
      log.info("Trainer is configured for sell off mode. Just dumping any low characters")
      gamePlayModeHandler = context.sellOff;
      events.emit('update:trainingMode', 'sell off')
      break;
  }
  return gamePlayModeHandler(context);
}

GameEngine.prototype.havestDaily = function (context) {

  return wait(10)
    .then(function () {
      return context.getBoard(context)
    })
    .then(function () {
      return context.click.center(context);
    })
    .then(function () {
      return wait(10);
    })
    .then(function () {
      return context.click.center(context);
    })
    .then(function () {
      return wait(10);
    })
    .then(function () {
      return context.click.center(context);
    })
};

GameEngine.prototype.getBoard = function (context) {
  if (context.board != undefined) {
    return context.board;
  } else {
    return context.board = context.driver.findElement(context.queries.board)
  }
}

GameEngine.prototype.startGame = function (context) {
  var driver = this.driver;

  return context.click.startGame(context)
    .then(function () {
      log.debug('waiting for game to load..')
      return wait(30)
    })
    .then(() => {
      return context.clearDailyRewardsAndNotifications(context) 
    })
    .then(function () {
      log.debug('waiting for rewards to clear')
      return wait(10)
    })
}

GameEngine.prototype.clearDailyRewardsAndNotifications = function (context) {
  return context.click.center(context)
    .then(function () {
      log.debug('clear daily reward');
      return wait(10);
    })
    .then( () => { 
      return context.click.center(context) 
    })
    .then(function () {
      log.debug('clearing reward card');
      return wait(10);
    })
}


GameEngine.prototype.click = {
  boardLocation: function (context, coordinates, logMessageName) {
    var driver = context.driver;

    log.debug("clicking '%s' location", logMessageName)
    log.debug('cords: ', coordinates);

    return new ActionSequence(driver)
      .mouseMove(context.board, coordinates)
      .click()
      .perform()
      .catch(function (e) {
        log.error("failed to click '%s' location: %o", logMessageName, coordinates, e)
      })
  },
  center: function (context) {
    return context.click.boardLocation(context, context.locations.center, 'Center of Board');
  },
  startGame: function (context) {
    return context.click.boardLocation(context, context.locations.startGame, 'Start Game');
  },
};

GameEngine.prototype.queries = {
  board: By.id('game_frame')
};

module.exports = GameEngine;