# node-telescope-server

## Overview

## Features


## Installation

    $ npm install node-telescope-server

## Help

    $ rts --help

    Usage: app [options]

    Options:

      -h, --help                      output usage information
      -V, --version                   output the version number
      -d, --debug                     enables the debug mode
      -s, --server <type>               server type [dummy|stellarium|web]
      -p, --port <port>               listening port
      -tt, --telescope-type <type>    telescope type [dummy|lx200|nexstar]
      -td, --telescope-device <path>  system path to telescope device
      -cd, --camera-device <path>     system path to camera device
      -c, --config <path>             configuration file path to setup several servers


## Setup your own remote server with a connected telescope

*** A dummy example ***

    $ rts
    Remote stellarium control server running at port 5000 to a dummy telescope

This command starts a stellarium control server listenning at port `5000` connected to a dummy telescope sending commands to `/dev/null`

*** Real Nexstar example ***

    $ rts -s stellarium -p 5050 -tt nexstar -td /dev/ttyS00
    Remote stellarium control server running at port 5050 to a dummy telescope

This command starts a stellarium control server listenning at port `5050` connected to a [Nexstar](https://github.com/visionmedia/express-resource "Nexstar Protocol") telescope sending commands to `/dev/ttyS00` device

*** Multiple servers ***

    $ rts -c config.json
    Telescope Dummy: Remote dummy control server running at port 4000 to a dummy telescope
    Telescope Stellarium Dummy: Remote stellarium control server running at port 4001 to a dummy telescope
    Disabled remote web control server running at port 4002 to a nextar telescope

This command starts several servers defined in the `config.json` file.

An example of config file:

```json
[
  {
    "name": "Telescope Dummy"
  , "server": "dummy"
  , "port": 4000
  , "telescope-device": "/dev/null"
  , "telescope-type": "dummy"
  },
  {
    "name": "Telescope Stellarium Dummy"
  , "server": "stellarium"
  , "port": 4001
  , "telescope-device": "/dev/random"
  , "telescope-type": "dummy"

  , "enabled": true
  },
  {
    "name": "Telescope Nextar"
  , "server": "web"
  , "port": 4002
  , "telescope-device": "/dev/ttyS00"
  , "telescope-type": "nextar"
  , "camera-device": "/dev/null"

  , "enabled": false
  }
]
```
