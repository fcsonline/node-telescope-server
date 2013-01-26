var program = require('commander');
var path = require('path');
var fs = require('fs');
var utils = require('./utils');

var availableServers = utils.getAvailableServers().join('|');
var availableTelescopes = utils.getAvailableTelescopes().join('|');

program
.version('0.0.1')
.option('-d, --debug', 'enables the debug mode', Boolean, false)
.option('-s, --server <type>', 'server type [' + availableServers + ']', String, 'stellarium')
.option('-p, --port <port>', 'listening port', Number, 5000)
.option('-tt, --telescope-type <type>', 'telescope type [' + availableTelescopes + ']', String, 'dummy')
.option('-td, --telescope-device <path>', 'system path to telescope device', String, '')
.option('-cd, --camera-device <path>', 'system path to camera device', String, '')
.option('-c, --config <path>', 'configuration file path to setup several servers', String, '')
.parse(process.argv);

function createServer(params) {

  var Server = require('./servers/' + params.type)
    , Telescope = require('./telescopes/' + params.telescopeType)
    , server = new Server()
    , telescope = new Telescope();

  server.on('move', function (position) {
    telescope.move(position);
  });

  server.listen(params);
}

if (!program.config) {

  // Single server by program arguments

  createServer({
    type: program.server
  , port: program.port
  , telescopeType: program.telescopeType
  , telescopeDevice: program.telescopeDevice
  , cameraDevice: program.cameraDevice
  , debug: program.debug
  });

} else {

  // Multiple servers by configuration file
  var configpath = path.resolve(program.config);

  if (fs.existsSync(configpath)) {
    var config = JSON.parse(fs.readFileSync(configpath));

    config.forEach(function (item) {
      var params = {
        name: item.name
      , type: item.server
      , port: item.port
      , telescopeType: item.telescopeType || item['telescope-type']
      , telescopeDevice: item.telescopeDevice || item['telescope-device']
      , cameraDevice: item.cameraDevice || item['camera-device']
      , debug: program.debug || item.debug
      };

      // Ignore non enabled servers, by default it is enabled
      if (item.enabled === false) {
        console.log(utils.disabled(params));
        return;
      }

      createServer(params);
    });

  } else {
    console.log("Config file not found");
    process.exit(1);
  }
}
