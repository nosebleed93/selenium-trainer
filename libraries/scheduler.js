var _ = require('lodash'),
  log = require('log4js').getLogger('scheduler'),
  schedule = require('node-schedule'),
  scheduleSettings = require('../schedule'),
  trainer = require('../trainer');

var privateMethods,
  publicMethods

publicMethods = {
  init: function () {
    log.info("loading scheduled tasks");

    try {
      _.each(scheduleSettings, (task) => {
        try {
          var rule = new schedule.RecurrenceRule();
          log.debug("Loading task", task.title);

          // Node-Schedule object literal syntax
          rule.minute = task.schedule.minute > -1 ? task.schedule.minute : null;
          rule.hour = task.schedule.hour > -1 ? task.schedule.hour : null;
          rule.dayOfWeek = task.schedule.dayOfWeek > -1 ? task.schedule.dayOfWeek : null;
          rule.date = task.schedule.date > -1 ? task.schedule.date : null;
          rule.month = task.schedule.month > -1 ? task.schedule.month : null;
          rule.year = task.schedule.year > -1 ? task.schedule.year : null;

          schedule.scheduleJob(rule, () => {
            log.info("Starting scheduled task:", task.title);
            trainer.scheduled.start(task.settings);
          });
          
        } catch (e) {
          log.error("schedule failed:", e);
        }

      });

      log.debug("All scheduled tasks loaded");
    } catch (e) {
      log.error("Scheduler exploded: ", e);
    }

  }
};
privateMethods = {};

module.exports = publicMethods;