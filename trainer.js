var _ = require('lodash'),
    configs = require('./configs'),
    log = require('log4js').getLogger('Trainer'),
    NutakuPage = require('./pages/nutaku'),
    webdriver = require('selenium-webdriver'),
    RSVP = require('rsvp'),
    Queue = require('queue');

var publicMethods,
    driver,
    nutakuPage;

publicMethods = {
  init: function(){
    return publicMethods.getSeleniumDriverInstance()
    .then(driverInstance => {
      driver = driverInstance;
      nutakuPage = new NutakuPage(driverInstance);
    })
    .then(() =>{
      return nutakuPage.loadLoginPage();
    })
    .then(() => {
      return nutakuPage.getLoginForm();
    })
    .then(loginForm => {
      return nutakuPage.login(loginForm);
    })
    .then(() => {
      return publicMethods.runTrainers(); 
    })
    .catch((error) => {
      log.error("Unexpected failure while trainer was running: ", error);
      process.exit(1);
    })
    .then(() => {
      log.info("All trainers finished successfully");
      process.exit(0);
    })
  },
  getSeleniumDriverInstance: function(){
    var seleniumServerPath = configs.selenium.protocol + "://" + configs.selenium.host + ':' + configs.selenium.port + configs.selenium.path;
        
    log.info("Getting selenium driver instance using url: ", seleniumServerPath);
    return new webdriver.Builder()
        .forBrowser(configs.selenium.browser)
        .usingServer(seleniumServerPath)
        .buildAsync();
  },
  runTrainers: function(){
    var deferred = RSVP.defer();
          
    try{
      var queueConfig = { concurrency: 1 },
          queue = new Queue(queueConfig);

      _.each(configs.game.active, (engineToTrain) => {
        var gameEngine;

        switch(engineToTrain){
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
        }

        queue.push((queueCompleted) => { 
          gameEngine.beginTrainer()
          .then(() => {queueCompleted();})
          });
      });

      queue.start((error) => {
        if(!error){
          deferred.resolve();
        } else {
          deferred.reject(error);
        }
        
      });

    }catch(e){
      log.error('failure while trying to get trainer: ', e);
    }

    return deferred;
  }
};

publicMethods.init();

module.exports = publicMethods;