var _ = require('lodash'),
  log = require('log4js').getLogger('publicMethods'),
  fs = require('fs'),
  RSVP = require('rsvp');

var publicMethods = {
  processImageList: function (imageList) {
    var processedImages = [];

    imageList = publicMethods.filterEmptyLines(imageList);

    if (imageList !== undefined && imageList.length > 0) {
      _.each(imageList, (image) => {
        var imageParts = image.split('/'),
          imageUrl;


        if (imageParts[imageParts.length - 1].includes('.')) {
          console.log('removing image from url');
          var imageNameLength = imageParts[imageParts.length - 1].length;

          imageUrl = image.substring(0, image.length - imageNameLength);
          if (imageUrl[imageUrl.length - 2] === '/') {
            imageUrl = imageUrl.substring(0, imageUrl.length - 1);
          }

          console.log('final url: ', imageUrl);
          if (processedImages.indexOf(imageUrl) < 0) {
            processedImages.push(imageUrl.trim());
          }
        }
      })
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

      console.log('found %s images', imageList.length);
    }

    return imageList;
  },
  formatListForStorage: function (imageList) {
    var formattedList = [];

    _.each(imageList, function (imageUrl) {
      var urlParts,
        id,
        object;

      if (imageUrl !== undefined) {
        urlParts = imageUrl.split('/');
        if (urlParts.length > 0) {
          id = urlParts[urlParts.length - 2];
        }
      }

      object = {
        id: id,
        url: imageUrl,
        name: ''
      }

      formattedList.push(object);

    });

    return formattedList;
  },
  storeChanges: function (imageList, fileName) {
    var deferred = RSVP.defer();

    storedContents = fs.readFile(fileName, (error, storedImageList) => {
      var formattedImageList;

      if (error) {
        log.error(error);

        storedImageList = [];
      } else {
        storedImageList = JSON.parse(storedImageList);
      }

      console.log(storedImageList.length);

      _.differenceWith(imageList, storedImageList, (imgUrl, storedObject) => {
        return storedObject.url === imgUrl ? true : false;
      })

      formattedImageList = publicMethods.formatListForStorage(imageList);
      console.log(formattedImageList.length);

      storedImageList = _.union(storedImageList, formattedImageList);

      try {
        fs.writeFileSync('./imageStore.json', JSON.stringify(storedImageList), 'utf-8');
        deferred.resolve();
      } catch (e) {
        log.error('failed to save data', e);
        deferred.reject();
      }

    });

    return deferred.promise;
  }
}

module.exports = publicMethods;