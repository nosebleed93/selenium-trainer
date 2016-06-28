var configs = require('../configs'),
  log = require('log4js').getLogger('Wait'),
  RSVP = require('rsvp');

var defaultWaitTime = 5;

module.exports = function (timeToWait) {
  var deferred = RSVP.defer();

  if (!timeToWait) {
    log.debug('no wait time specified, using default time %s s ', defaultWaitTime)
    timeToWait = defaultWaitTime;
  }

  if (configs.waitMultiplyer > 0) {
    timeToWait = timeToWait * configs.waitMultiplyer;
  }

  log.debug('waiting for %ss', timeToWait);
  setTimeout(function () {
    deferred.resolve();
  }, timeToWait * 1000)

  return deferred.promise;
}