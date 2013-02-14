var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Telescope(params) {

  // Stream to telescope device
  this.device = fs.createWriteStream(params.telescopeDevice, {'flags': 'a'});

  // Command queue
  this.queue = [];

  this.device.on("end", function () {
    console.log("Nextar telescope disconected!");
  });

  this.device.on("data", function (data) {
    var ibuffer = new Buffer(data)
      , ra_int
      , dec_int;

    // TODO READ: <ra 8 bytes>,<dec 8 bytes>#

    this.emit('track', {
      ra: ra_int
    , dec: dec_int
    });
  });


  this.goto = function (position) {

    if (!params.quiet) {
      console.log("Moving nextar telescope to: ", position);
    }

    // Add the received command to the queue and process it
    this.queue.push(position);
    this.process();
  };

  this.process = function () {
    var command = this.queue.shift()
      , obuffer = new Buffer(18);

    // TODO WRITE: r<ra 8 bytes>,<dec 8 bytes>

    // Write the next command and wait for a device response
    this.device.write(obuffer);
  };
}

util.inherits(Telescope, EventEmitter);

module.exports = Telescope;
