var _ =require('lodash'),
    log = require('log4js').getLogger('scheduler'),
    schedule = require('node-schedule'),
    scheduleSettings = require('../schedule'),
    trainer = require('../trainer');

var privateMethods,
  publicMethods

publicMethods = {
  init: function(){
    log.info("loading scheduled tasks");

    _.each(scheduleSettings, (task) => {
      schedule.scheduleJob(task.schedule, () => {
        log.info("Starting scheduled task: ", task.title);
        trainer.scheduled.start(task.settings);
      });

    });
  }
};
privateMethods = {};

module.exports = publicMethods;