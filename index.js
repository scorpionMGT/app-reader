var ApkReader = require("./lib/ApkReader");
var IpaReader = require("./lib/IpaReader");
var fs  = require("fs");
var path = require("path");

function PkgReader(path, extension, options) {
  return new (extension === "ipa" ? IpaReader : ApkReader)(path, options);
}

module.exports = PkgReader;