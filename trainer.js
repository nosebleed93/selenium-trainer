var _ = require('lodash'),
  configs = require('./configs'),
  events = require('./libraries/events').getInstance(),
  log = require('log4js').getLogger('Trainer'),
  NutakuPage = require('./pages/nutaku'),
  webdriver = require('selenium-webdriver'),
  RSVP = require('rsvp'),
  Queue = require('queue');

var publicMethods;

publicMethods = {
  init: (runtimeConfigs) => {
    var driver,
      nutakuPage;

    return publicMethods.getSeleniumDriverInstance()
      .then(driverInstance => {
        driver = driverInstance;
        nutakuPage = new NutakuPage(driverInstance);
      })
      .then(() => {
        return nutakuPage.loadLoginPage();
      })
      .then(() => {
        return nutakuPage.getLoginForm();
      })
      .then(loginForm => {
        return nutakuPage.login(loginForm);
      })
      .then(() => {
        return publicMethods.runTrainers(runtimeConfigs, nutakuPage);
      })
      .then(() => {
        log.info("Training completed")
        events.emit('update:text-status', 'idle');
        events.emit('update:gameEngine', 'none');
        events.emit('update:roundCount', '');
        events.emit('update:trainingMode', '');

        driver.quit();
      })
  },
  getSeleniumDriverInstance: () => {
    var seleniumServerPath = configs.selenium.protocol + "://" + configs.selenium.host + ':' + configs.selenium.port + configs.selenium.path;

    log.info("Getting selenium driver instance using url: ", seleniumServerPath);
    return new webdriver.Builder()
      .forBrowser(configs.selenium.browser)
      .usingServer(seleniumServerPath)
      .buildAsync();
  },
  runTrainers: (runtimeConfigs, nutakuPage) => {
    var deferred = RSVP.defer();

    try {
      var queueConfig = { concurrency: 1 },
        queue = new Queue(queueConfig);

      _.each(configs.game.active, (engineToTrain) => {
        var gameEngine;

        switch (engineToTrain) {
          case 'osawari':
            log.debug("Oswari game configured");
            var Oswari = require('./pages/game/osawari-island');
            gameEngine = new Oswari(nutakuPage, configs.osawari);
            break;
          case 'aigis':
            log.debug("Aigis game configured");
            var Aigis = require('./pages/game/aigis');
            gameEngine = new Aigis(nutakuPage, configs.aigis);
            break;
          case 'hellfire':
            log.debug("Hellfire game configured");
            var Hellfire = require('./pages/game/hellfire');
            gameEngine = new Hellfire(nutakuPage, configs.hellfire, 'jp');
            break;
          case 'hellfire':
            log.debug("Hellfire US game configured");
            var Hellfire = require('./pages/game/hellfire');
            gameEngine = new Hellfire(nutakuPage, configs.hellfireUS, 'us');
            break;

          default:
            log.error("no configured handler for ", engineToTrain);
            break;
        }

        queue.push((queueCompleted) => {
          events.emit('update:gameEngine', gameEngine.type);
          gameEngine.beginTrainer()
            .then(() => { queueCompleted(); })
        });
      });

      queue.start((error) => {
        if (!error) {
          deferred.resolve();
        } else {
          deferred.reject(error);
        }

      });

    } catch (e) {
      log.error('failure while trying to get trainer: ', e);
    }

    return deferred;
  },
  scheduled: {
    start: (runtimeConfigs) => {
      var scheduledDriver,
      scheduledNutakuPage;

      return publicMethods.getSeleniumDriverInstance()
        .then(driverInstance => {
          scheduledDriver = driverInstance;
          return scheduledNutakuPage = new NutakuPage(driverInstance);
        })
        .then(() => {
          return scheduledNutakuPage.loadLoginPage();
        })
        .then(() => {
          return scheduledNutakuPage.getLoginForm();
        })
        .then((loginForm) => {
          return scheduledNutakuPage.login(loginForm);
        })
        .then(() => {
          return publicMethods.scheduled.runTrainers(runtimeConfigs, scheduledNutakuPage);
        })
        .then(() => {
          log.info("Training completed")
          events.emit('update:text-status', 'idle');
          events.emit('update:gameEngine', 'none');
          events.emit('update:roundCount', '');
          events.emit('update:trainingMode', '');

          scheduledDriver.quit();
        })
        .catch((error) => {
          log.error("Unexpected error: ", error);
          scheduledDriver.quit();
        })
    },
    runTrainers: (runtimeConfigs, scheduledNutakuPage) => {
      var deferred = RSVP.defer();

      try {
        var queueConfig = { concurrency: 1 },
          queue = new Queue(queueConfig);

        _.each(runtimeConfigs.engine, (engineToTrain) => {
          var gameEngine;

          switch (engineToTrain) {
            case 'osawari':
              log.debug("Oswari game configured");
              var Oswari = require('./pages/game/osawari-island');
              gameEngine = new Oswari(scheduledNutakuPage, runtimeConfigs);
              break;
            case 'aigis':
              log.debug("Aigis game configured");
              var Aigis = require('./pages/game/aigis');
              gameEngine = new Aigis(scheduledNutakuPage, runtimeConfigs);
              break;
            case 'hellfire':
              log.debug("Hellfire game configured");
              var Hellfire = require('./pages/game/hellfire');
              gameEngine = new Hellfire(scheduledNutakuPage, runtimeConfigs, 'jp');
              break;
            case 'hellfireUS':
              log.debug("Hellfire US game configured");
              var Hellfire = require('./pages/game/hellfire');
              gameEngine = new Hellfire(scheduledNutakuPage, runtimeConfigs, 'us');
              break;

            default:
              log.error("no configured handler for ", engineToTrain);
              break;
          }

          queue.push((queueCompleted) => {
            events.emit('update:gameEngine', gameEngine.type);
            gameEngine.beginTrainer()
              .then(() => { queueCompleted(); })
          });
        });

        queue.start((error) => {
          if (!error) {
            deferred.resolve();
          } else {
            deferred.reject(error);
          }

        });

      } catch (e) {
        log.error('failure while trying to get trainer: ', e);
      }

      return deferred;
    },
  }
};

// publicMethods.init()
//   .catch((error) => {
//     log.error("Unexpected failure while trainer was running: ", error);
//     process.exit(1);
//   })
//   .then(() => {
//     log.info("All trainers finished successfully");
//     process.exit(0);
//   })

module.exports = publicMethods;