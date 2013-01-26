var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Server() {
  this.listen = function (params) {
    console.log(utils.welcome(params));
  };
}

util.inherits(Server, EventEmitter);

module.exports = Server;
