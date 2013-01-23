var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Telescope() {
  this.move = function (position) {
    console.log("Moving dummy telescope to: ", position);
  };
}

util.inherits(Telescope, EventEmitter);

module.exports = Telescope;
