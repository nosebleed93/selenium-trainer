var _ = require('lodash'),
  configs = require('../../configs'),
  log = require('log4js').getLogger('Aigis Trainer'),
  GameEngine = require('../../gameEngine'),
  webdriver = require('selenium-webdriver'),
  ActionSequence = webdriver.ActionSequence,
  By = webdriver.By,
  until = webdriver.until,
  Queue = require('queue'),
  RSVP = require('rsvp'),
  wait = require('../../utilities/wait');

// 960 x 640 -> 480 x 320
var locations = {
  center: { x: 480, y: 320 },
  startGame: { x: 480, y: 320 },
};

function AigisGame(nutakuPage, gameConfigs) {
  GameEngine.call(this, nutakuPage, gameConfigs);
  this.constructor = AigisGame;
  this.type = 'Aigis';
  this.url =  "http://www.nutaku.net/games/millennium-war-aigis/play/"
}

AigisGame.prototype = Object.create(GameEngine.prototype);


AigisGame.prototype.havestDaily = function (context) {

  return wait(10)
    .then(function () {
      return context.getBoard(context)
    })
    .then(function () {
      return context.click.center(context);
    })
    .then(function () {
      return wait(40);
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