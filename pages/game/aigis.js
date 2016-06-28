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
    center: { x: 475, y: 275 },
    startGame: { x: 475, y: 275 },
  };

function AigisGame(nutakuPage, gameConfigs) {
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

var clickActions = {
  playGame: function (context) {
    return context.click.boardLocation(context, locations.play, 'Play Game');
  },
  home: function (context) {
    return context.click.boardLocation(context, locations.home, 'Home');
  },
  mainMenu: function (context) {
    return context.click.boardLocation(context, locations.mainMenu, 'Main Menu');
  },
  missions: function (context) {
    return context.click.boardLocation(context, locations.missions, 'Mission Selection');
  },
  missionRowOne: function (context) {
    return context.click.boardLocation(context, locations.missionRowOne, 'Mission - Row 1');
  },
  missionRowTwo: function (context) {
    return context.click.boardLocation(context, locations.missionRowTwo, 'Mission - Row 2');
  },
  missionDoIt: function (context) {
    return context.click.boardLocation(context, locations.missionDoIt, 'Mission - Do It');
  }
}, localQueries = {

}

_.merge(AigisGame.prototype.click, clickActions);
_.merge(AigisGame.prototype.queries, localQueries);

AigisGame.prototype.locations = locations;

module.exports = AigisGame;
module.exports.locations = locations;