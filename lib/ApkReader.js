var inherits = require('inherits');
var Reader = require('./Reader');
var ManifestParser = require('./manifest');
var utils = require('./utils');
var fs = require("fs");
var MANIFEST_FTIL_NAME = /^androidmanifest\.xml$/;
var RESOURCE_FILE_NAME = /^resources\.arsc$/;

var DEFAULT_OPTIONS = {
  ignore: [
    'uses-sdk.minSdkVersion',
    'application.activity',
    'application.service',
    'application.receiver',
    'application.provider'
  ],
  searchResource: true,
  withIcon: true,
  iconType: 'base64', // 'base64', 'file'
  iconPath: ''
};

function ApkReader(path, options) {
  if (!(this instanceof ApkReader)) return new ApkReader(path, options);
  Reader.call(this, path);
  this.options = utils.extend({}, DEFAULT_OPTIONS, (options || {}));
}

inherits(ApkReader, Reader);

ApkReader.prototype.parse = function(callback) {
  var that = this;
  var whatYouNeed = [MANIFEST_FTIL_NAME];
  if (this.options.searchResource) whatYouNeed.push(RESOURCE_FILE_NAME);

  this.getEntries(whatYouNeed, function(error, buffers) {
    if (error) return callback(error);
    that.parseManifest(buffers[MANIFEST_FTIL_NAME], function(error, apkInfo) {
      if (error) return callback(error);

      if (that.options.searchResource) {
        that.parseResorceMap(buffers[RESOURCE_FILE_NAME], function(error, resourceMapStr) {
          if (error) {
            return callback(error);
          }
          utils.findOutResources(apkInfo, resourceMapStr);
          if (that.options.withIcon) {
            var icon = utils.findOutIcon(apkInfo, 'apk');
            if (icon) {
              return that.getEntry(icon, function(error, buffers) {
                if (error) {
                  console.error('Error happened when try paring icon.');
                  console.error(error);
                  return callback(null, apkInfo);
                }
                fs.writeFile(that.options.iconPath,buffers,function(err) {
                })          
                var iconType = that.options.iconType;
                if(iconType == "base64") {
                  // var base64Icon = buffers.toString('base64');
                  // if (base64Icon) {
                  //   apkInfo.icon = "data:image/png;base64,"+base64Icon;
                  // }
                  callback(null, apkInfo);
                } else if(iconType == "file") {
                  callback(null, apkInfo);
                }
              });
            }
          }

          callback(null, apkInfo);
        });
      }
    });
  });
};

ApkReader.prototype.parseManifest = function(manifestBuffer, callback) {
  var apkInfo;
  try {
    apkInfo = new ManifestParser(manifestBuffer, {
      ignore: [
        'application.activity',
        'application.service',
        'application.receiver',
        'application.provider',
        'permission-group'
      ]
    }).parse();
  } catch (e) {
    return callback(e);
  }

  callback(null, apkInfo);
};

module.exports = ApkReader;
