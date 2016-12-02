var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Telescope(params) {

  fs.exists(params.telescopeDevice, function (exists) {
    if (!exists) {
      throw Error('Unable to open the Lx2000 device descriptior: ' + params.telescopeDevice);
    }
  });

  // Stream to telescope device
  this.device = fs.createWriteStream(params.telescopeDevice, {'flags': 'a'});

  // Session closed
  this.device.on("end", function () {
    console.log("LX200 telescope disconected!");
  });

  this.device.on("data", function (data) {
    var ibuffer = new Buffer(data)
      , ra_int = 0
      , dec_int = 0;

    if (params.debug) {
      console.log('LX200 input: ', ibuffer);
    }

    this.emit('track', {
      ra: ra_int
    , dec: dec_int
    });
  });

  this.goto = function (position) {
    if (!params.quiet) {
      console.log("Moving LX200 telescope to: ", position);
    }
  };
}

util.inherits(Telescope, EventEmitter);

module.exports = Telescope;
