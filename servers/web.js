var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var microtime = require('microtime');
var utils = require('../utils');

function Server(params) {
  var self = this;

  this.listen = function () {
    console.log(utils.welcome(params));

    var app = express.createServer();

    app.post('/api/position', function (req, res) {
      var ra = req.param('ra', null)
        , dec = req.param('dec', null);

      if (!ra || !dec) {
        res.send("Missing ra or dec parameters", 400);
        return;
      }

      self.emit('move', {
        ra: ra
      , dec: dec
      });

      res.send(200);
    });

    app.listen(params.port);
  };
}

util.inherits(Server, EventEmitter);

module.exports = Server;
