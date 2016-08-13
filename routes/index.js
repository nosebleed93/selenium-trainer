var _ = require('lodash'),
  cache = require('../cache'),
  configs = require('../configs'),
  express = require('express'),
  fs = require('fs'),
  log = require('log4js').getLogger('/'),
  router = express.Router(),
  schedule = require('../schedule');

router
  .get('/', function (req, res, next) {
    res.render('index', {
      title: configs.projectName,
      projectName: configs.projectName
    });
  })

  .get('/client', function (req, res, next) {
    res.render('client', {
      title: configs.projectName,
      projectName: configs.projectName
    });
  })

  .get('/manage/config/:configToManage', function(req, res, next){
    var configToManage = req.params.configToManage,
      activeConfig = schedule[configToManage];

    if(activeConfig !== undefined){
      res.render('gameConfig', {
        title: configs.projectName,
        projectName: configs.projectName,
        config: activeConfig
      });
    } else {
      console.error('no found config using key', configToManage);
      res.redirect('/');
    }

    
  })

module.exports = router;