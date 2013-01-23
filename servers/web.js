var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Server() {
  this.type = 'web';
  this.listen = function (program) {

  };
}

util.inherits(Server, EventEmitter);

module.exports = Server;
