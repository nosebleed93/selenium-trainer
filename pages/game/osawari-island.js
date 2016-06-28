var _ = require('lodash'),
  configs = require('../../configs'),
  events = require('../../libraries/events').getInstance(),
  log = require('log4js').getLogger('Osawari Trainer'),
  GameEngine = require('../../gameEngine'),
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
  playQuest: { x: 817, y: 366 },
  eventOne: { x: 401, y: 150 },
  eventTwo: { x: 555, y: 156 },
  rowOne: { x: 720, y: 172 },
  rowTwo: { x: 720, y: 258 },
  rowThree: { x: 720, y: 329 },
  letsGo: { x: 735, y: 309 },
  capture: { x: 874, y: 501 },
  questRewardsNext: { x: 898, y: 113 },
  characterExp: { x: 902, y: 79 },
  eventRewards: { x: 905, y: 41 }
};

function IslandGame(nutakuPage, gameConfigs) {
  GameEngine.call(this, nutakuPage, gameConfigs);
  this.constructor = IslandGame;
  this.type = 'Oswari Island';
}

IslandGame.prototype = Object.create(GameEngine.prototype);

// IslandGame.prototype.startGame = function (context) {
//   var driver = this.driver;

//   return context.click.startAdventure(context)
//     .then(function () {
//       log.debug('waiting for game to load..')
//       return wait(30)
//     })
// }

IslandGame.prototype.determineLocation = function (context) {
  var clickAction;
  switch (configs.osawari.location) {
    case 'eventOne':
      log.debug("Detected 'Event Area 1' as desired location selection");
      clickAction = context.click.eventOne;
      break;
    case 'eventTwo':
      log.debug("Detected 'Event Area 2' as desired location selection");
      clickAction = context.click.eventTwo;
      break;
    case 'daily':
      log.debug("Detected 'Daily Event' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '1':
      log.debug("Detected 'Emerald Forest' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '2':
      log.debug("Detected 'Seraphina Academy' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '3':
      log.debug("Detected 'Perido Volcano' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '4':
      log.debug("Detected 'Sapphire Beach' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '5':
      log.debug("Detected 'Orchids Cave' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '6':
      log.debug("Detected 'Tokioi City' as desired location selection");

      log.error("Location not yet configured")
      break;
    case '7':
      log.debug("Detected 'Red Peril Lava Cave' as desired location selection");

      log.error("Location not yet configured")
      break;
    default:
      log.debug("Unable to map config osawari.location to a valid value. Using default event location 1");

      log.error("Location not yet configured")
      break;
  }

  return clickAction;
}

IslandGame.prototype.determineRow = function (context) {
  var clickAction;
  switch (configs.osawari.levelRow) {
    case 1:
      log.debug("Detected Row 1 as desired row selection");
      clickAction = context.click.rowOne;
      break;
    case 2:
      log.debug("Detected Row 2 as desired row selection");
      clickAction = context.click.rowTwo;
      break;
    case 3:
      log.debug("Detected Row 3 as desired row selection");
      clickAction = context.click.rowThree;
      break;
    case 4:
      log.debug("Detected Row 4 as desired row selection");
      clickAction = context.click.rowFour;
      break;
    default:
      log.debug("Unable to map config osawari.levelRow to a valid value. Using default level 1");
      clickAction = context.click.rowOne;
      break;
  }

  return clickAction;
}

IslandGame.prototype.playStatic = function (context) {
  var cycleCount = 1,
    currentCount = 0,
    deferred = RSVP.defer(),
    driver = this.driver,
    locationSelector = context.determineLocation(context),
    levelSelector = context.determineRow(context),
    playQueue = Queue();


  log.info("Starting play cycle for %s rounds", configs.osawari.playCycleCount);

  return context.click.playQuest(context)
    .then(function () {
      return wait(10);
    })
    .then(function () {
      for (var i = 1; i <= configs.osawari.playCycleCount; i++) {
        playQueue.push((queueCompletedCallback) => {
          context.executeCycle(context, locationSelector, levelSelector, currentCount)
            .then(function () {
              return wait(5);
            })
            .then(function () {
              queueCompletedCallback();
            })
        })

      }

      playQueue.on('success', function () {
        currentCount++;
        log.info("Completed a round");
      })

      playQueue.start(function () {
        log.info("All rounds completed.");
        deferred.resolve();
      })

      return deferred.promise;
    })

}

IslandGame.prototype.executeCycle = function (context, locationSelector, levelSelector, cycleCount) {
  return locationSelector(context)
    .then(function () {
      log.info("Starting play round %s", cycleCount);
      events.emit('update:roundCount', cycleCount);
      return wait(3)
    })
    .then(function () {
      return levelSelector(context)
    })
    .then(function () {
      return wait(2)
    })
    .then(function () {
      return context.click.letsGo(context)
    })
    .then(function () {
      var minutesToWait = 6;
      return wait(minutesToWait * 60);
    })
    .then(function () {
      return context.click.capture(context)
    })
    .then(function () {
      return wait(25)
    })
    .then(function () {
      return context.click.questRewardsNext(context)
    })
    .then(function () {
      return wait(17)
    })
    .then(function () {
      return context.click.characterExp(context);
    })
    .then(function () {
      return wait(5)
    })
    .then(function () {
      return context.click.eventRewards(context);
    })
}

var localClickActions = {
  startGame: function (context) {
    return context.click.boardLocation(context, locations.startGame, 'Start Adventure');
  },
  playQuest: function (context) {
    return context.click.boardLocation(context, locations.playQuest, 'Play Quest');
  },
  letsGo: function (context) {
    return context.click.boardLocation(context, locations.letsGo, 'Lets Go');
  },
  eventOne: function (context) {
    return context.click.boardLocation(context, locations.eventOne, 'Event One');
  },
  eventTwo: function (context) {
    return context.click.boardLocation(context, locations.eventTwo, 'Event Two');
  },
  rowOne: function (context) {
    return context.click.boardLocation(context, locations.rowOne, 'Row One');
  },
  rowTwo: function (context) {
    return context.click.boardLocation(context, locations.rowTwo, 'Row Two');
  },
  rowThree: function (context) {
    return this.boardLocation(context, locations.rowThree, 'Row Three');
  },
  rowFour: function (context) {
    return this.boardLocation(context, locations.rowFour, 'Row Four');
  },
  capture: function (context) {
    return context.click.boardLocation(context, locations.capture, 'Capture Eromon');
  },
  questRewardsNext: function (context) {
    return context.click.boardLocation(context, locations.questRewardsNext, 'Quest Rewards - Next');
  },
  characterExp: function (context) {
    return context.click.boardLocation(context, locations.characterExp, 'Character Experience - Next');
  },
  eventRewards: function (context) {
    return context.click.boardLocation(context, locations.eventRewards, 'Event Rewards - Play Again');
  }
}, localQueries = {

};


_.merge(IslandGame.prototype.click, localClickActions);
_.merge(IslandGame.prototype.queries, localQueries);

IslandGame.prototype.locations = locations;

module.exports = IslandGame;
module.exports.locations = locations;