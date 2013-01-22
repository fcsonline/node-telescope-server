/*jshint bitwise: true*/

var program = require('commander');
var path = require('path');
var net = require('net');
var microtime = require('microtime');
var walk = require('walk');
var path = require('path');
var fs = require('fs');

function getAvailableTelescopes() {
  return fs.readdirSync('./telescopes/').map(function (item) {
    return item.slice(0, -3);
  });
}

function getAvailableServers() {
  return fs.readdirSync('./servers/').map(function (item) {
    return item.slice(0, -3);
  });
}

program
.version('0.0.1')
.option('-t, --type <type>', 'server type [' + getAvailableServers().join('|') + ']', String, 'stellarium')
.option('-p, --port <port>', 'listening port', Number, 5000)
.option('-tt, --telescope-type <type>', 'telescope type [' + getAvailableTelescopes().join('|') + ']', String, 'dummy')
.option('-td, --telescope-device <path>', 'system path to telescope device', String, '')
.option('-cd, --camera-device <path>', 'system path to camera device', String, '')
.parse(process.argv);

function PrintRaDec(position) {
  var h = position.ra_int
    , d = Math.floor(0.5 + position.dec_int * (360 * 3600 * 1000 / 4294967296.0))
    , dec_sign
    , message
    , ra_ms
    , ra_s
    , ra_m
    , dec_ms
    , dec_s
    , dec_m;

  if (d >= 0) {
    if (d > 90 * 3600 * 1000) {
      d =  180 * 3600 * 1000 - d;
      h += 0x80000000;
    }
    dec_sign = '+';
  } else {
    if (d < -90 * 3600 * 1000) {
      d = -180 * 3600 * 1000 - d;
      h += 0x80000000;
    }
    d = -d;
    dec_sign = '-';
  }

  h = Math.floor(0.5 + h * (24 * 3600 * 10000 / 4294967296.0));
  ra_ms = h % 10000; h = Math.floor(h / 10000);
  ra_s = h % 60; h = Math.floor(h / 60);
  ra_m = h % 60; h = Math.floor(h / 60);
  h %= 24;

  dec_ms = d % 1000; d = Math.floor(d / 1000);
  dec_s = d % 60; d = Math.floor (d/ 60);
  dec_m = d % 60; d = Math.floor(d / 60);

  message  = "ra = " + h + 'h';
  message += ra_m + 'm';
  message += ra_s + '.';
  message += ra_ms;
  message += " dec = " + dec_sign + d + 'h';
  message += dec_m + 'm';
  message += dec_s + '.';
  message += dec_ms;

  return message;
}

var server = require('./servers/' + program.type);
var telescope = require('./telescopes/' + program.telescopeType);

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

    // console.log("New desired position: " + PrintRaDec(desired_position));


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

    console.log("Sending position: " + PrintRaDec(current_position));
    writePosition();

  }, 100);

}).listen(program.port);

console.log("Remote control telescope server running at port " + program.port + "\n");
