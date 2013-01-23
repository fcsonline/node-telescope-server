var program = require('commander');
var utils = require('./utils');

var availableServers = utils.getAvailableServers().join('|');
var availableTelescopes = utils.getAvailableTelescopes().join('|');

program
.version('0.0.1')
.option('-t, --type <type>', 'server type [' + availableServers + ']', String, 'stellarium')
.option('-p, --port <port>', 'listening port', Number, 5000)
.option('-tt, --telescope-type <type>', 'telescope type [' + availableTelescopes + ']', String, 'dummy')
.option('-td, --telescope-device <path>', 'system path to telescope device', String, '')
.option('-cd, --camera-device <path>', 'system path to camera device', String, '')
.parse(process.argv);

var Server = require('./servers/' + program.type);
var Telescope = require('./telescopes/' + program.telescopeType);

var server = new Server();
var telescope = new Telescope();

server.listen(program);

server.on('move', function (position) {
  console.log("Moving to: " + position);
  telescope.move(position);
});
