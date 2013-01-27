var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var microtime = require('microtime');
var utils = require('../utils');

function Server(params) {
  this.listen = function () {

    var self = this;

    function lshift(num, bits) {
      return num * Math.pow(2, bits);
    }

    function rshift(num, bits) {
      return num * Math.pow(2, -bits);
    }

    // Start a TCP Server
    net.createServer(function (socket) {

      var interval
        , current_position
        , desired_position;

      current_position = desired_position = {
        x: 0.0
      , y: 0.0
      , z: 0.0

      , ra_int: 0
      , dec_int: 0
      };

      // Identify this client
      console.log('\nNew incoming connection from ' + socket.remoteAddress + ":" + socket.remotePort);

      function writePosition() {

        var obuffer = new Buffer(24)
          , time = microtime.now()
          , h
          , ra
          , ra_int
          , dec
          , dec_int;

        if (params.debug) {
          console.log("1CP-X:", current_position.x);
          console.log("1CP-Y:", current_position.y);
          console.log("1CP-Z:", current_position.z);
        }

        current_position.x = 3 * current_position.x + desired_position.x;
        current_position.y = 3 * current_position.y + desired_position.y;
        current_position.z = 3 * current_position.z + desired_position.z;

        if (params.debug) {
          console.log("2CP-X:", current_position.x);
          console.log("2CP-Y:", current_position.y);
          console.log("2CP-Z:", current_position.z);
        }

        h = current_position.x * current_position.x
          + current_position.y * current_position.y
          + current_position.z * current_position.z;

        if (params.debug) {
          console.log("   H:", h);
        }

        if (h > 0.0) {
          h = 1.0 / Math.sqrt(h);
          current_position.x *= h;
          current_position.y *= h;
          current_position.z *= h;
        } else {
          current_position.x = desired_position.x;
          current_position.y = desired_position.y;
          current_position.z = desired_position.z;
        }

        if (params.debug) {
          console.log("CP-X:", current_position.x);
          console.log("CP-Y:", current_position.y);
          console.log("CP-Z:", current_position.z);
        }

        ra  = Math.atan2(current_position.y, current_position.x);
        dec = Math.atan2(current_position.z, Math.sqrt(current_position.x * current_position.x + current_position.y * current_position.y));

        if (params.debug) {
          console.log(" RA :", ra);
          console.log(" DEC:", dec);
        }

        current_position.ra_int = Math.abs(Math.floor(0.5 + ra * (0x80000000 / Math.PI)));
        current_position.dec_int = Math.floor(0.5 + dec * (0x80000000 / Math.PI));

        if (params.debug) {
          console.log(" RA-I :", current_position.ra_int);
          console.log(" DEC-I:", current_position.dec_int);
        }

        obuffer.writeUInt16LE(obuffer.length, 0);
        obuffer.writeUInt16LE(0, 2);

        // Why not? U_U time = ibuffer.readDoubleLE(4);
        obuffer.writeDoubleLE(time, 4);
        obuffer.writeUInt8(time & 0xFF, 4); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 5); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 6); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 7); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 8); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 9); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 10); time = rshift(time, 8);
        obuffer.writeUInt8(time & 0xFF, 11); time = rshift(time, 8);

        obuffer.writeUInt32LE(current_position.ra_int, 12);
        obuffer.writeInt32LE(current_position.dec_int, 16);
        obuffer.writeUInt32LE(0, 20);

        if (params.debug) {
          console.log('Output: ', obuffer);
        }

        socket.write(obuffer);
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
          , cdec;

        if (params.debug) {
          console.log('Input: ', ibuffer);
        }

        length  = ibuffer.readUInt16LE(0);
        type    = ibuffer.readUInt16LE(2);

        // Why not? U_U time = ibuffer.readDoubleLE(4);
        time    = lshift(ibuffer.readUInt8(4), 0) +
                  lshift(ibuffer.readUInt8(5), 8) +
                  lshift(ibuffer.readUInt8(6), 16) +
                  lshift(ibuffer.readUInt8(7), 24) +
                  lshift(ibuffer.readUInt8(8), 32) +
                  lshift(ibuffer.readUInt8(9), 40) +
                  lshift(ibuffer.readUInt8(10), 48) +
                  lshift(ibuffer.readUInt8(11), 56);

        ra_int  = ibuffer.readUInt32LE(12);
        dec_int = ibuffer.readUInt32LE(16);

        ra = ra_int * (Math.PI / 0x80000000);
        dec = dec_int * (Math.PI / 0x80000000);
        cdec = Math.cos(dec);

        desired_position = {
          x: Math.cos(ra) * cdec
        , y: Math.sin(ra) * cdec
        , z: Math.sin(dec)
        };

        self.emit('move', {
          ra: ra_int
        , dec: dec_int
        });

      });

      socket.on('end', function () {
        if (!params.quiet) {
          console.log("Connection to client closed!");
        }

        clearInterval(interval);
      });

      interval = setInterval(function () {
        if (!params.quiet) {
          console.log("Sending position: " + utils.printRaDec(current_position));
        }

        writePosition();
      }, 1000);

    }).listen(params.port);

    console.log(utils.welcome(params));
  };
}


util.inherits(Server, EventEmitter);

module.exports = Server;
