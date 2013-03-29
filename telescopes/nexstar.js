var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');
var ExponentialBuffer = require('../lib/exponential.buffers');

function Telescope(params) {

  fs.exists(params.telescopeDevice, function (exists) {
    if (!exists) {
      throw Error('Unable to open the NexStar device descriptior: ' + params.telescopeDevice);
    }
  });

  // Stream to telescope device
  this.device = fs.createWriteStream(params.telescopeDevice, {'flags': 'a'});

  // Command queue
  this.queue = [];

  // Session closed
  this.device.on("end", function () {
    console.log("Nextar telescope disconected!");
  });

  // Incomming data
  this.device.on("data", function (data) {
    var ibuffer = new ExponentialBuffer(data)
      , ra_int
      , dec_int;

    if (params.debug) {
      console.log('Nexstar input: ', ibuffer);
    }

    // READ: <ra 8 bytes>,<dec 8 bytes>#
    ra_int = ibuffer.readDoubleExponential(0);
    dec_int = ibuffer.readDoubleExponential(9);

    this.emit('track', {
      ra: ra_int
    , dec: dec_int
    });
  });

  // Outgoing data
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
      , obuffer = new ExponentialBuffer(18);

    console.log("Command: ", command);

    // WRITE: r<ra 8 bytes>,<dec 8 bytes>
    obuffer.write('r', 0);
    obuffer.writeDoubleExponential(command.ra, 1);
    obuffer.write(',', 9);
    obuffer.writeDoubleExponential(command.dec, 10);

    if (params.debug) {
      console.log('Nexstar output: ', obuffer);
    }

    // Write the next command and wait for a device response
    this.device.write(obuffer);
  };
}

util.inherits(Telescope, EventEmitter);

module.exports = Telescope;
