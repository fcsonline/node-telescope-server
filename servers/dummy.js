var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var microtime = require('microtime');
var utils = require('../utils');

function Server(params) {

  var self = this;

  this.listen = function () {
    console.log(utils.welcome(params));
  };

  this.track = function (position) {
    // Process the message comming from the telescope to the server client
  };
}

util.inherits(Server, EventEmitter);

module.exports = Server;
