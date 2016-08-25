var _ = require('lodash'),
  cache = require('../cache'),
  configs = require('../configs.js'),
  log = require('log4js').getLogger('publicMethods'),
  fs = require('fs'),
  RSVP = require('rsvp');

var publicMethods = {
  processImageList: function (rawImageList) {
    var processedImages = [],
      filteredImageList;

    filteredImageList = publicMethods.filterEmptyLines(rawImageList);
    filteredImageList = publicMethods.filterUnwantedImageUrls(filteredImageList);

    if (filteredImageList !== undefined && filteredImageList.length > 0) {
      _.each(filteredImageList, (image) => {
        var imageParts = image.split('/'),
          imageObject,
          imageUrl;

        if (imageParts[imageParts.length - 1].includes('.')) {
          var imageNameLength = imageParts[imageParts.length - 1].length;

          imageUrl = image.substring(0, image.length - imageNameLength);
          if (imageUrl[imageUrl.length - 2] === '/') {
            imageUrl = imageUrl.substring(0, imageUrl.length - 1);
          }

          log.debug('final url: ', imageUrl);

          if (processedImages.indexOf(imageUrl) < 0) {
            imageObject = publicMethods.formatImageData(imageUrl.trim());

            if (imageObject !== undefined) {
              processedImages.push(imageObject);
            }
          }
        }
      })
    }

    if (processedImages.length > 0) {
      var categoryList = [];
      _.each(configs.extension.acceptedDomains, function (domainObject) {
        var categoryObject = {
          images: _.remove(processedImages, function (imageObject) {
            return imageObject.url.includes(domainObject.domain)
          }),
          name: domainObject.name,
          category: domainObject.category
        }

        categoryList.push(categoryObject);
      })

      processedImages = categoryList;
    }

    return processedImages;

  },
  filterEmptyLines: function (rawImageList) {
    var imageList;

    if (rawImageList !== undefined) {
      imageList = rawImageList.split('\n');

      // filter out empty lines
      _.remove(imageList, (line) => {
        return line.length < 2;
      })

      log.debug('found %s images', imageList.length);
    }

    return imageList;
  },
  filterUnwantedImageUrls: function (rawImageList) {
    var removedImages;

    if (rawImageList !== undefined) {

      removedImages = _.remove(rawImageList, function (imageUrl) {
        var acceptedDomain = _.find(configs.extension.acceptedDomains, function (domainObject) {
          return imageUrl.includes(domainObject.domain);
        })
        return acceptedDomain === undefined;
      })

      console.log('removed %s images using unwated domains', removedImages.length);
    }

    return rawImageList;

  },
  formatListForStorage: function (imageList) {
    var formattedList = [];

    if (imageList !== undefined && imageList.length > 0) {
      _.each(imageList, function (imageUrl) {
        var imageAsObject = publicMethods.formatImageData(imageUrl);

        if (imageAsObject !== undefined) {
          formattedList.push(object);
        }

      });
    }

    return formattedList;
  },
  formatImageData: function (imageUrl) {
    var urlParts,
      id,
      imageObject;

    if (imageUrl !== undefined) {
      urlParts = imageUrl.split('/');
      if (urlParts.length > 0) {
        id = urlParts[urlParts.length - 2];
      }
    }

    imageObject = {
      id: id,
      url: imageUrl,
      name: '',
      season: 0,
    }

    return imageObject;
  },
  storeChanges: function (imageList, fileName) {
    var deferred = RSVP.defer();

    if (imageList !== undefined && imageList.length > 0) {
      storedContents = fs.readFile(fileName, (error, storedImageList) => {
        var formattedImageList, dedupedImageList;

        if (error) {
          log.error(error);

          storedImageList = [];
        } else {
          storedImageList = JSON.parse(storedImageList);
        }



        // formattedImageList = _.union(imageList, storedImageList);
        dedupedImageList = _.each(imageList, function (categoryObject) {
          log.debug('Current stored count:', categoryObject.images.length);
          var dedeuppedCategory = _.uniqBy(categoryObject.images, 'id');
          categoryObject.images = dedeuppedCategory;

          log.info('%s unique images in category %s', dedeuppedCategory.length, categoryObject.name);
        })

        try {
          fs.writeFileSync('./imageStore.json', JSON.stringify(dedupedImageList), 'utf-8');
          cache.storedImageData = dedupedImageList;
          deferred.resolve();
        } catch (e) {
          log.error('failed to save data', e);
          deferred.reject(e);
        }

      });
    } else {
      deferred.reject('no images to add');
    }


    return deferred.promise;
  },
  removeImageFromCollection: function (idToDelete, imageList, category) {
    var removedValue,
      categoryList;

    log.info('deleting image ', idToDelete);

    if (idToDelete && imageList !== undefined && category !== undefined) {
      categoryList = publicMethods.findImageCategory(category, imageList);

      if (categoryList !== undefined) {
        removedValue = _.remove(categoryList.images, function (image, i) {
          return image.id === idToDelete;
        });

        if (removedValue !== undefined && removedValue.length > 0) {
          console.log('successfully removed item: ', removedValue)
          return true
        }
      }

    }

    return false;
  },
  updateImageInCollection: function (imageData, imageList, category) {
    var categoryList = publicMethods.findImageCategory(category, imageList),
      currentImage,
      tempNumber;

    if (categoryList !== undefined) {
      currentImage = _.find(categoryList.images, (imageObject) => {
        return imageData.id === imageObject.id;
      });

      if (currentImage !== undefined) {
        currentImage.name = imageData.name;
        tempNumber = parseInt(imageData.season, 10);
        if (tempNumber != 'NaN') {
          currentImage.season = tempNumber;
        }

        return true;
      } else {
        log.error('unable to find image using id: ', imageData.id);
      }

    }

    return false;
  },
  findImageCategory: function (category, imageList) {
    return _.find(imageList, function (list) {
      return list.category === category;
    })
  },
  pickImageSource: function (selectedSource, sessionList, storedList) {
    var selectedList;

    switch (selectedSource) {
      case 'session':
        log.debug('session imageList selected')
        selectedList = sessionList;
        break;
      case 'archive':
        log.debug('archive imageList selected')
        selectedList = storedList;
        break;
    }

    return selectedList;
  },
  getTotalImageCount: function(imageList){
    var count = 0;
    _.each(imageList, function(categoryList){
      count += categoryList.images.length;
    })
    return count;
  }
}

module.exports = publicMethods;