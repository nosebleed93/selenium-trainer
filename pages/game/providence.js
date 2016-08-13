var _ = require('lodash'),
  events = require('../../libraries/events').getInstance(),
  log = require('log4js').getLogger('Osawari Trainer'),
  GameEngine = require('../../gameEngine'),
  gameSettings = require('../../settings/osawari'),
  webdriver = require('selenium-webdriver'),
  ActionSequence = webdriver.ActionSequence,
  By = webdriver.By,
  until = webdriver.until,
  Queue = require('queue'),
  RSVP = require('rsvp'),
  wait = require('../../utilities/wait');

var locations = {
  center: { x: 270, y: 480 },
  startGame: { x: 738, y: 413 },
  home: By.className(),
  quest: {
    letsGo: { x: 735, y: 309 },
    eventOne: { x: 401, y: 150 },
    eventTwo: { x: 555, y: 156 },
    rowOne: { x: 720, y: 172 },
    rowTwo: { x: 720, y: 258 },
    rowThree: { x: 720, y: 329 },
    rowFour: { x: 720, y: 408 },
    completed: {
      capture: { x: 874, y: 501 },
      rewardsNext: { x: 898, y: 113 },
      characterExp: { x: 902, y: 79 },
      eventRewards: { x: 905, y: 41 },
    }
  },
  mainMenu: {
    conquest: By.className('gSubNav-GVR'),
    raid: By.className('gSubNav-Raid '),
    quest: By.className('gSubNav-Quest'),
    gift: By.className('gSubNav-Gift')
  },
};

function ProvidenceGame(nutakuPage, gameConfigs) {
  GameEngine.call(this, nutakuPage, gameConfigs);
  this.constructor = ProvidenceGame;
  this.type = 'Dragon Providence';
  this.url = "http://www.nutaku.net/games/dragon-providence/play/";
}

ProvidenceGame.prototype = Object.create(GameEngine.prototype);


var localClickActions = {
  playQuest: function (context) {
    return context.click.boardLocation(context, locations.playQuest, 'Play Quest');
  },
  home: function (context) {
    return context.click.boardLocation(context, locations.quest.home, 'Lets Go');
  },
  release: {
  }

}, localQueries = {

};

_.merge(ProvidenceGame.prototype.click, localClickActions);
_.merge(ProvidenceGame.prototype.queries, localQueries);

ProvidenceGame.prototype.locations = locations;

module.exports = ProvidenceGame;
module.exports.locations = locations;