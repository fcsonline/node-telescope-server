var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var microtime = require('microtime');
var utils = require('../utils');

function Server() {
  this.type = 'stellarium';
  this.listen = function (program) {

    var self = this;

    // Start a TCP Server
    net.createServer(function (socket) {

      var interval
        , current_position
        , desired_position;

      current_position = desired_position = {
        a: 1.0
      , b: 0.0
      , c: 0.0
      };

      // Identify this client
      console.log('\nNew incoming connection from ' + socket.remoteAddress + ":" + socket.remotePort);

      function writePosition(position) {

        position = position || current_position;

        var obuffer = new Buffer(24)
          , time = microtime.now();

        console.log("ITime: " + time.toString());

        obuffer.writeUInt16LE(obuffer.length, 0);
        obuffer.writeUInt16LE(0, 2);
        obuffer.writeDoubleLE(time, 4);
        obuffer.writeUInt32LE(current_position.ra_int, 12);
        obuffer.writeUInt32LE(current_position.dec_int, 16);
        obuffer.writeUInt32LE(0, 20);

        console.log('Output', obuffer);

        socket.write(obuffer.toString());
      }

      socket.on('data', function (raw) {
        var ibuffer = new Buffer(raw)
          , length
          , type
          , time
          , ra_int
          , dec_int

          , ra
          , dec
          , cdec

          , position;

        console.log('Input ', ibuffer);

        length  = ibuffer.readUInt16LE(0);
        type    = ibuffer.readUInt16LE(2);
        time    = ibuffer.readDoubleLE(4);
        ra_int  = ibuffer.readUInt32LE(12);
        dec_int = ibuffer.readUInt32LE(16);

        console.log("ITime: " + time.toString());

        ra = ra_int * (Math.PI / 0x80000000);
        dec = dec_int * (Math.PI / 0x80000000);
        cdec = Math.cos(dec);

        current_position = desired_position = {
          a: Math.cos(ra) * cdec
        , b: Math.sin(ra) * cdec
        , c: Math.sin(dec)

        , time: time
        , ra_int: ra_int
        , dec_int: dec_int
        };

        self.emit('move', {
          ra: ra_int
        , dec: dec_int
        });

        writePosition();
      });

      socket.on('end', function () {
        console.log("Connection to client closed!");
        clearInterval(interval);
      });

      interval = setInterval(function () {
        if (!desired_position.time1) {
          return;
        }

        console.log("Sending position: " + utils.printRaDec(current_position));
        writePosition();

      }, 100);

    }).listen(program.port);

    console.log("Remote control telescope server running at port " + program.port + "\n");
  };
}


util.inherits(Server, EventEmitter);

module.exports = Server;
