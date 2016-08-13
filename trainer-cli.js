var commander = require('commander'),
    configs = require('./configs'),
    trainer = require('./trainer');


commander
  .version('1.0.0')
  .parse(process.argv)

trainer.init();      