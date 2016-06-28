/**
 * Merge with hellfire us game
 */
var _ = require('lodash'),
  configs = require('../../configs'),
  log = require('log4js').getLogger('Hellfire Trainer'),
  GameEngine = require('../../gameEngine'),
  webdriver = require('selenium-webdriver'),
  ActionSequence = webdriver.ActionSequence,
  By = webdriver.By,
  until = webdriver.until,
  Queue = require('queue'),
  RSVP = require('rsvp'),
  wait = require('../../utilities/wait');

var locations = {
  center: { x: 475, y: 275 },
  startGame: { x: 140, y: 72 },
  home: { x: 57, y: 49 },
  mainMenu: { x: 918, y: 45 },
  missions: { x: 114, y: 205 },
  missionRowOne: { x: 504, y: 209 },
  missionRowTwo: { x: 504, y: 374 },
  missionDoIt: { x: 757, y: 520 }
};

function HellFireGame(nutakuPage, gameConfigs) {
  GameEngine.call(this, nutakuPage, gameConfigs);
  this.constructor = HellFireGame;
  this.type = 'Hell Fire Girls';
}

HellFireGame.prototype = Object.create(GameEngine.prototype);

var localClickActions = {
  startGame: function (context) {
    return context.click.boardLocation(context, locations.startGame, 'Start Game');
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
},
  localQueries = {

  };

_.merge(HellFireGame.prototype.click, localClickActions);
_.merge(HellFireGame.prototype.queries, localQueries);

HellFireGame.prototype.locations = locations;

module.exports = HellFireGame;
module.exports.locations = locations;