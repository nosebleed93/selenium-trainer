var _ = require('lodash'),
  cache = require('../cache'),
  configs = require('../configs'),
  express = require('express'),
  log = require('log4js').getLogger('/'),
  imageUtility = require('../utilities/imageUtility'),
  router = express.Router(),
  schedule = require('../schedule');

router
  .get('/add', function (req, res, next) {
    var imageList = req.session.imageList;

    if (imageList === undefined) {
      req.session.imageList = imageList = [];
    }

    console.log(imageList.length)

    res.render('extension/view', {
      title: configs.projectName,
      projectName: configs.projectName,
      imageList: imageList
    });
  })

  .get('/current', function (req, res, next) {
    var imageList = [];

    log.info("Loading %s elements from cache", cache.storedImageData.length);
    _.each(cache.storedImageData, (imageData) => {
      imageList.push(imageData.url);
    })
    
    res.render('extension/view', {
      title: configs.projectName,
      projectName: configs.projectName,
      imageList: imageList
    });
  })

  .post('/scanUrls', function (req, res, next) {
    try {
      var rawImageList = req.body.imageList,
        sessionImageList = req.session.imageList,
        imageList;

      console.log('received', rawImageList);


      imageList = imageUtility.processImageList(rawImageList);
      imageList = _.union(sessionImageList, imageList);

      req.session.imageList = imageList;
      console.log(req.session.imageList.length)

      res.render('extension/view', {
        title: configs.projectName,
        projectName: configs.projectName,
        imageList: imageList
      });
    } catch (e) {
      log.error('Failed to process images', e);
      res.status(500);
    }

  })

  .delete('/image/:index', function (req, res, next) {
    try {
      var indexToDelete = parseInt(req.params.index, 10),
        removedValue;

      log.info('deleting image ', indexToDelete);

      removedValue = _.remove(req.session.imageList, function (image, i) {
        return i === indexToDelete;
      });

      if (removedValue !== undefined) {
        console.log('successfully removed item: ', removedValue)
        res.status(200).json({ ErrorNumber: 0 });
      } else {
        res.status(404);
      }
    } catch (e) {
      log.error('failed to delete image', e);
      res.status(500);
    }

  })

  .post('/file/save', function (req, res, next) {
    try {
      var imageList = req.session.imageList,
        formattedImageList;

      formattedImageList = imageUtility.formatListForStorage(imageList);

      if (formattedImageList !== undefined) {

      }


    } catch (e) {
      log.error('Failed to save file store', e);
      res.status(500);
    }

  })

  .post('/file/update', function (req, res, next) {
    try {
      var imageList = req.session.imageList;

      imageUtility.storeChanges(imageList, './imageStore.json')
        .then(() => {
          res.status(200);
        })
        .catch(() => {
          res.status(500);
        })
      
    } catch (e) {
      log.error('Failed to update file store', e);
      res.status(500);
    }

  })

module.exports = router;