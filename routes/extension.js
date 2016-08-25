var _ = require('lodash'),
  archiver = require('archiver'),
  cache = require('../cache'),
  configs = require('../configs'),
  express = require('express'),
  log = require('log4js').getLogger('/'),
  imageUtility = require('../utilities/imageUtility'),
  request = require('request'),
  router = express.Router(),
  schedule = require('../schedule');

router

  .get('/walkthrough', function(req,res,next){
    res.render('extension/walkthrough', {
      title: configs.projectName,
      projectName: configs.projectName
    });
  })

  .get('/add', function (req, res, next) {
    var imageList = req.session.imageList;

    if (imageList === undefined) {
      req.session.imageList = imageList = [];
    }

    res.render('extension/view', {
      title: configs.projectName,
      projectName: configs.projectName,
      imageList: imageList,
      imageCount: imageUtility.getTotalImageCount(imageList),
      source: 'session'
    });
  })

  .get('/current', function (req, res, next) {
    try {
      var imageList

      if (cache.storedImageData !== undefined) {
        imageList = cache.storedImageData.slice(0);
        if (imageList === undefined) {
          imageList = cache.storedImageData = [];
        }

        if (req.session.filters === undefined) {
          req.session.filters = {
            jp: false,
            us: false
          }
        }

        if (req.session.filters.jp) {
          _.remove(imageList, function (categoryObject) {
            return categoryObject.category === 'hellfireGirlsJP';
          })
        }

        if (req.session.filters.us) {
          _.remove(imageList, function (categoryObject) {
            return categoryObject.category === 'hellfireGirlsUS';
          })
        }

        log.info("Loading %s elements from cache", cache.storedImageData.length);

        res.render('extension/view', {
          title: configs.projectName,
          projectName: configs.projectName,
          imageList: imageList,
          imageCount: imageUtility.getTotalImageCount(imageList),
          source: 'archive'
        });
      } else {

        res.render('extension/view', {
          title: configs.projectName,
          projectName: configs.projectName,
          imageList: [],
          imageCount: 0,
          source: 'archive'
        });

      }

    } catch (e) {
      log.error('failed while getting /current', e)
      res.redirect('/');
    }

  })

  .post('/scanUrls', function (req, res, next) {
    try {
      var rawImageList = req.body.imageList,
        sessionImageList = req.session.imageList,
        imageList;

      console.log('received', rawImageList);

      if (rawImageList !== undefined) {
        imageList = imageUtility.processImageList(rawImageList);

        imageList = _.union(sessionImageList, imageList);

        req.session.imageList = imageList;
        console.log(req.session.imageList.length)

        res.redirect('/extension/add');
      } else {
        res.status(500).send();
      }

    } catch (e) {
      log.error('Failed to process images', e);
      res.status(500).send();
    }

  })

  .delete('/image/:id', function (req, res, next) {
    try {
      var idToDelete = req.params.id,
        category = req.body.category,
        imageListSource = req.body.source,
        imageList = imageUtility.pickImageSource(imageListSource, req.session.imageList, cache.storedImageData);

      if (imageList !== undefined) {
        log.debug('removing image from %s', imageListSource);

        if (imageUtility.removeImageFromCollection(idToDelete, imageList, category)) {
          return res.status(200).send();
        }
      }

    } catch (e) {
      log.error('failed to delete image', e);
      res.status(500).send();
    }

    return res.status(404).send()
  })

  .post('/session/clear', function (req, res, next) {
    try {

      log.debug('clearing session');

      req.session.imageList = [];
      res.status(200).send()

    } catch (e) {
      log.error('failed to clear session', e);
      res.status(500).send();
    }

  })

  .post('/update/image', function (req, res, next) {
    try {
      var id = req.body.id,
        name = req.body.name,
        season = req.body.season,
        category = req.body.category,
        imageListSource = req.body.source,
        imageList = imageUtility.pickImageSource(imageListSource, req.session.imageList, cache.storedImageData),
        requestImageObject;

      if (imageList !== undefined) {
        log.debug('updating image id [%s] in category [%s] using source [%s]', id, category, imageListSource);

        if (id !== undefined) {
          requestImageObject = {
            id: id,
            name: name,
            season: season
          };

          if (imageUtility.updateImageInCollection(requestImageObject, imageList, category)) {
            res.status(200).send();
          } else {
            res.status(404).send();
          }
        } else {
          res.status(500).send();
        }
      } else {
        res.status(500).send();
      }

    } catch (e) {
      log.error('failed to update image', e);
      res.status(500).send();
    }

  })

  // .post('/session/update/image', function (req, res, next) {
  //   try {
  //     var id = req.body.id,
  //       name = req.body.name,
  //       season = req.body.season,
  //       requestImageObject;

  //     if (id !== undefined) {
  //       requestImageObject = {
  //         id: id,
  //         name: name,
  //         season: season
  //       };

  //       if (imageUtility.updateImageInCollection(requestImageObject, req.session.imageList)) {
  //         res.status(200).send();
  //       } else {
  //         res.status(404).send();
  //       }

  //     } else {
  //       res.status(500).send();
  //     }


  //   } catch (e) {
  //     log.error('failed to update image', 1001);
  //     res.status(500).send();
  //   }

  // })

  .post('/update/collection', function (req, res, next) {
    try {
      var imageListSource = req.body.source,
        imageList = imageUtility.pickImageSource(imageListSource, req.session.imageList, cache.storedImageData);

      if (imageList !== undefined) {
        log.debug('Storing images');

        imageUtility.storeChanges(imageList, './imageStore.json')
          .then(() => {
            res.status(200).send();
          })
          .catch((e) => {
            log.error(e);
            res.status(500).send();
          })

      } else {
        res.status(404).send();
      }

    } catch (e) {
      log.error('Failed to update file store', e);
      res.status(500).send();
    }

  })

  .get('/download', function (req, res) {
    var archive = archiver.create('zip');

    archive.on('error', function (err) {
      res.status(500).send({ error: err.message });
    });

    //set the archive name
    res.attachment('hellfireGirls.zip');

    //on stream closed we can end the request
    archive.on('end', function () {
      log.debug('Created zip sized %d bytes', archive.pointer());
    });

    archive.pipe(res)

    _.each(cache.storedImageData, function (image) {
      var imageData,
        fileName = image.name !== undefined && image.name !== '' ? image.name : image.id;

      imageData = request(image.url + 'full.jpg')
        .on('error', function (e) {
          log.error('failed to load image %s:', fileName, e);
        })

      archive.append(imageData, { name: fileName + '.jpg' });
    });

    archive.finalize();
  })

module.exports = router;