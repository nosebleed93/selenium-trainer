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
  playQuest: { x: 817, y: 366 },
  dontShowMessageAgain: {x: 662, y:493},
  closeMessageWindow: {x: 826, y:61},
  quest: {
    letsGo: { x: 735, y: 309 },
    eventOne: { x: 401, y: 150 },
    eventTwo: { x: 555, y: 156 },
    rowOne: { x: 720, y: 172 },
    rowTwo: { x: 720, y: 258 },
    rowThree: { x: 720, y: 329 },
    rowFour: { x: 720, y: 408 },
    skipDialog: {x: 745, y:525},
    firstClearReward: {x: 486, y: 434},
    completed: {
      capture: { x: 874, y: 501 },
      rewardsNext: { x: 898, y: 113 },
      characterExp: { x: 902, y: 79 },
      eventRewards: { x: 905, y: 41 },
    }
  },
  mainMenu: {
    openButton: { x: 940, y: 28 },
    releaseEromon: { x: 740, y: 240 },
  },
  releaseEromon: {
    typeN: { x: 510, y: 374 },
    typeR: { x: 534, y: 374 },
    selectAll: { x: 372, y: 375 },
    releaseButton: { x: 862, y: 314 },
    confirmRelease: { x: 421, y: 462 },
    confirmMoney: { x: 504, y: 437 }
  }

};

function IslandGame(nutakuPage, gameConfigs) {
  GameEngine.call(this, nutakuPage, gameConfigs);
  this.constructor = IslandGame;
  this.type = 'Oswari Island';
  this.url = "http://www.nutaku.net/games/osawari-island/play/";
}

IslandGame.prototype = Object.create(GameEngine.prototype);

IslandGame.prototype.determineLocation = function (context) {
  var clickAction;
  switch (context.configs.location) {
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
  switch (context.configs.levelRow) {
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

IslandGame.prototype.findRowFromLevel = function (context, level) {
  var rowIndex = level % gameSettings.rowsPerPage,
    clickAction;

  log.debug("Level %s maps to row %s", level, rowIndex);
  switch (rowIndex) {
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
    case 0:
      log.debug("Detected Row 4 as desired row selection");
      clickAction = context.click.rowFour;
      break;
  }

  return clickAction;
}

IslandGame.prototype.playAdvance = function (context) {
  var cycleCount = 1,
    deferred = RSVP.defer(),
    queueConfig = { concurrency: 1 },
    playQueue = Queue(queueConfig),
    levelToTrain;

  log.info("Starting play cycle for %s rounds", context.configs.playCycleCount);

  levelToTrain = _.find(gameSettings.levels, (level) => {
    if (level.index == context.configs.level.location) {
      return true;
    }
  })

  if (!levelToTrain) {
    throw "Couldn't find the level you have configed"
  }

  log.debug("Training level %s", levelToTrain.title);

  return context.click.playQuest(context)
    .then(() => wait(10))
    .then(function () {
      for (var i = context.configs.level.start; i <= levelToTrain.maxLevels; i++) {
        log.debug("Setting up level run %s", i);

        (function (context, index) {
          playQueue.push((queueCompletedCallback) => {

            var roundSelection = context.findRowFromLevel(context, index),
              levelMapLocation = levelToTrain.entryLocation;

            context.executeCycle(context, levelMapLocation, roundSelection, index, levelToTrain.event)
              .then(() => wait(5))
              .then(() => queueCompletedCallback())
          })
        })(context, i)

      }

      playQueue.on('success', function () {
        log.info("Completed a round");
      })

      playQueue.start(function () {
        log.info("All rounds completed.");
        deferred.resolve();
      })

      return deferred.promise;
    })
}

IslandGame.prototype.playStatic = function playStatic(context) {
  var cycleCount = 1,
    deferred = RSVP.defer(),
    locationSelector = context.determineLocation(context),
    levelSelector = context.determineRow(context),
    queueConfig = { concurrency: 1 },
    playQueue = Queue(queueConfig),
    levelToTrain

  levelToTrain = _.find(gameSettings.levels, (level) => {
    if (level.index == context.configs.level.location) {
      return true;
    }
  })

  if (!levelToTrain) {
    throw "Couldn't find the level you have configed"
  }

  log.info("Starting play cycle for %s rounds", context.configs.playCycleCount);

  return context.click.playQuest(context)
    .then(() => wait(17))
    .then(function () {
      for (var i = 1; i <= context.configs.playCycleCount; i++) {

        (function (context, index) {

          playQueue.push((queueCompletedCallback) => {

            var roundSelection = context.findRowFromLevel(context, context.configs.level.start),
              levelMapLocation = levelToTrain.entryLocation;

            log.debug("Starting round %s", index)
            context.executeCycle(context, levelMapLocation, roundSelection, index, levelToTrain.event)
              .then(() => wait(5))
              .then(() => queueCompletedCallback())
          });

        })(context, i)

      }

      playQueue.on('success', function () {
        log.info("Completed a round");
      })

      playQueue.start(function () {
        log.info("All rounds completed, starting sell off");

        wait(5)
          .then(function () {
            return context.sellOff(context)
          })
          .then(deferred.resolve)
      })

      return deferred.promise;
    })

}

IslandGame.prototype.executeCycle = function (context, levelMapLocation, roundSelection, cycleCount, isAnEvent) {
  var isEvent = isAnEvent || false;
  // return locationSelector(context)
  //   .then(() => {
  //     log.info("Starting play round %s", cycleCount);
  //     events.emit('update:roundCount', cycleCount);

  //     return wait(4);
  //   })
  //   .then(() => {
  //     if (typeof levelSelector == 'object') {
  //       return context.click.boardLocation(context, levelSelector, 'adv click')
  //     } else {
  //       ;
  //     }
  //   })

  return new RSVP.Promise(function (resolve, reject) {
    if (typeof levelMapLocation == 'object') {
      return context.click.boardLocation(context, levelMapLocation, 'adv click')
        .then(() => resolve())
    } else {
      return levelMapLocation(context)
        .then(() => resolve());
    }
  })
    .then(() => wait(6))
    .then(function () {
      return roundSelection(context)
    })
    .then(function () {
      return wait(6)
    })
    .then(function () {
      return context.click.letsGo(context)
    })
    .then(function () {
      return wait(15);
    })
    .then(function(){
      // Skip Pre level talk
      return context.click.skipDialog(context)
    })
    .then(function () {
      var minutesToWait = 3;
      return wait(minutesToWait * 60);
    })
    .then(function(){
      // Skip pre boss talk
      return context.click.skipDialog(context)
    })
    .then(function () {
      var minutesToWait = 2;
      return wait(minutesToWait * 60);
    })
    .then(function(){
      // Skip post boss talk
      return context.click.skipDialog(context)
    })
    .then(function () {
      return wait(25)
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
      return wait(10)
    })
    .then(function(){
      return context.click.firstClearReward(context)
    })
    .then(function () {
      return wait(5)
    })
    .then(function () {
      if (isEvent) {
        return context.click.characterExp(context)
          .then(function () {
            return wait(5)
          })
      } else {
        return;
      }
    })
    .then(function () {
      return context.click.eventRewards(context);
    })
    .catch((error) => {
      log.error("Error while training ", error);
    })
}

IslandGame.prototype.sellOff = function sellOff(context) {
  var deferred = RSVP.defer(),
    queueConfig = { concurrency: 1 },
    sellQueue = Queue(queueConfig);

  log.info("Starting sell off for %s rounds", context.configs.sellOffCount);

  wait(5)
    .then(() => context.click.mainMenu(context))
    .then(() => wait(5))
    .then(() => context.click.menuReleaseEromon(context))
    .then(() => wait(10))
    .then(() => {
      for (var i = 1; i <= context.configs.sellOffCount; i++) {
        sellQueue.push((sellQueueCallback) => {
          context.sellOffCycle(context)
            .then(() => wait(5))
            .then(sellQueueCallback)
        })
      };

      sellQueue.on('success', function () {
        log.info("Completed a round");
      })

      sellQueue.start(function () {
        log.info("All rounds completed.");
        deferred.resolve();
      })

    })

  return deferred.promise;
}

IslandGame.prototype.sellOffCycle = function sellOffCycle(context) {
  return this.click.release.selectTypeN(this)
    .then(() => wait(5))
    .then(() => this.click.release.selectAll(this))
    .then(() => wait(5))
    .then(() => this.click.release.releaseButton(this))
    .then(() => wait(5))
    .then(() => this.click.release.confirmRelease(this))
    .then(() => wait(5))
    .then(() => this.click.release.confirmMoney(this))
    .then(() => wait(5))
}

var localClickActions = {
  playQuest: function (context) {
    return context.click.boardLocation(context, locations.playQuest, 'Play Quest');
  },
  letsGo: function (context) {
    return context.click.boardLocation(context, locations.quest.letsGo, 'Lets Go');
  },
  eventOne: function (context) {
    return context.click.boardLocation(context, locations.quest.eventOne, 'Event One');
  },
  eventTwo: function (context) {
    return context.click.boardLocation(context, locations.quest.eventTwo, 'Event Two');
  },
  rowOne: function (context) {
    return context.click.boardLocation(context, locations.quest.rowOne, 'Row One');
  },
  rowTwo: function (context) {
    return context.click.boardLocation(context, locations.quest.rowTwo, 'Row Two');
  },
  rowThree: function (context) {
    return context.click.boardLocation(context, locations.quest.rowThree, 'Row Three');
  },
  rowFour: function (context) {
    return context.click.boardLocation(context, locations.quest.rowFour, 'Row Four');
  },
  skipDialog: function (context) {
    return context.click.boardLocation(context, locations.quest.skipDialog, 'Skip Dialog');
  },
  firstClearReward: function (context) {
    return context.click.boardLocation(context, locations.quest.firstClearReward, 'First Clear Reward');
  },
  capture: function (context) {
    return context.click.boardLocation(context, locations.quest.completed.capture, 'Capture Eromon');
  },
  questRewardsNext: function (context) {
    return context.click.boardLocation(context, locations.quest.completed.rewardsNext, 'Quest Rewards - Next');
  },
  characterExp: function (context) {
    return context.click.boardLocation(context, locations.quest.completed.characterExp, 'Character Experience - Next');
  },
  eventRewards: function (context) {
    return context.click.boardLocation(context, locations.quest.completed.eventRewards, 'Event Rewards - Play Again');
  },
  mainMenu: (context) => {
    return context.click.boardLocation(context, locations.mainMenu.openButton, 'Main Menu');
  },
  menuReleaseEromon: (context) => {
    return context.click.boardLocation(context, locations.mainMenu.releaseEromon, 'Main Menu - Release Eromon');
  },
  release: {
    selectTypeN: (context) => {
      return context.click.boardLocation(context, locations.releaseEromon.typeN, 'Select N Type');
    },
    selectTypeR: (context) => {
      return context.click.boardLocation(context, locations.releaseEromon.typeR, 'Select R Type');
    },
    selectAll: (context) => {
      return context.click.boardLocation(context, locations.releaseEromon.selectAll, 'Select All Eromon');
    },
    releaseButton: (context) => {
      return context.click.boardLocation(context, locations.releaseEromon.releaseButton, 'Release Selected Eromon');
    },
    confirmRelease: (context) => {
      return context.click.boardLocation(context, locations.releaseEromon.confirmRelease, 'Confirm Release Eromon');
    },
    confirmMoney: (context) => {
      return context.click.boardLocation(context, locations.releaseEromon.confirmMoney, 'Confirm Money Recived');
    }
  }

}, localQueries = {

};

_.merge(IslandGame.prototype.click, localClickActions);
_.merge(IslandGame.prototype.queries, localQueries);

IslandGame.prototype.locations = locations;

module.exports = IslandGame;
module.exports.locations = locations;