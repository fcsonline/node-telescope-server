var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Telescope(params) {
  var device = fs.createWriteStream(params.telescopeDevice, {'flags': 'a'});

  this.move = function (position) {
    if (!params.quiet) {
      console.log("Moving nextar telescope to: ", position);
      device.write(JSON.stringify(position) + '\n');
    }
  };
}

util.inherits(Telescope, EventEmitter);

module.exports = Telescope;
