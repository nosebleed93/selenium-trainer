var configs = require('../../configs'),
  log = require('log4js').getLogger('Aigis Trainer'),
  GameEngine = require('../../gameEngine'),
  webdriver = require('selenium-webdriver'),
  ActionSequence = webdriver.ActionSequence,
  By = webdriver.By,
  until = webdriver.until,
  Queue = require('queue'),
  RSVP = require('rsvp'),
  wait = require('../../utilities/wait');

var board,
  locations = {
    startAdventure: { x: 738, y: 413 },
  };

function AigisGame(nutakuPage, gameConfigs) {
  // this.driver = nutakuPage.driver;
  GameEngine.call(this, nutakuPage, gameConfigs);
  this.constructor = AigisGame;
  this.type = 'Aigis';
}

AigisGame.prototype = Object.create(GameEngine.prototype);

AigisGame.prototype.getBoard = function () {
  if (board != undefined) {
    return board;
  } else {
    return board = this.driver.findElement(this.queries.board)
  }
}

AigisGame.prototype.startGame = function () {
  var context = this,
    driver = this.driver;

  wait(5)
    .then(function () {
      log.debug("looking for game board");
      return context.getBoard()
    })
    .catch(function (e) {
      log.error('unable to find game board!', e);
    })
    .then(function () {
      log.debug("Found game board");
    })
    .then(function () {
      return context.click.startAdventure(context);
    })
    .then(function () {
      log.debug('waiting for game to load..')
      return wait(30)
    })
    .then(function () {
      return context.click.playQuest(context);
    })
    .then(function () {
      return wait(7);
    })
    .then(function () {
      var gamePlayModeHandler;

      switch (configs.osawari.mode) {
        case 'advancement':
          log.info('Trainer is configured for advancement mode. Perpare to clear different levels.');
          // TODO: Implement advancement game play
          gamePlayModeHandler = context.playStatic;
          break;
        case 'static':
        default:
          log.info("Trainer is configured for static mode. No level advancement will take place")
          gamePlayModeHandler = context.playStatic;
          break;

      }
      return gamePlayModeHandler(context);
    })
    .then(function () {
      log.info("Training session completed successfully")
      driver.quit()
        .then(function () {
          process.exit(0);
        })

    })
    .catch(function (e) {
      log.error("Unexpect failure: ", e)
      driver.quit()
        .then(function () {
          process.exit(1);
        })
    })

}

AigisGame.prototype.queries = {
  board: By.id('aigis')
}

module.exports = AigisGame;
module.exports.locations = locations;