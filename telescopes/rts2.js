var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Telescope(params) {
  this.move = function (position) {
    if (!params.quiet) {
      console.log("Moving RTS2 telescope to: ", position);
    }
  };
}

util.inherits(Telescope, EventEmitter);

module.exports = Telescope;
