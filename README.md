# node-telescope-server

## Overview

node-telescope-server is server to control telescopes remotely. Actually it is a port of C++ [source](http://www.stellarium.org) to NodeJS. With an easy of set of commands you will be able to connect your computer to a telescope and target it to the desired stellar object.

## Features

* Interface control for Stellarium software
* Interface control thought a HTTP REST API
* Compatible with NexStar telescopes
* Compatible running with multiple telescopes at same time

## Future features

* Interface control thought WebSockets
* Remote camera capabilities
* Compatibility with LX200 and RTS2 telescopes

## Installation

    $ npm install node-telescope-server -g

## Help

    $ nts --help

    Usage: app [options]

    Options:

      -h, --help                     output usage information
      -V, --version                  output the version number
      -q, --quiet                    enables the quiet mode
      -d, --debug                    enables the debug mode
      -s, --server <type>            server type [dummy|stellarium|web]
      -p, --port <port>              listening port
      -t, --telescope-type <type>    telescope type [dummy|lx200|nexstar|rts2]
      -i, --telescope-device <path>  system path to telescope device
      -c, --config <path>            configuration file path to setup several servers

## Getting started

**A dummy example**

    $ nts
    Remote stellarium control server running at port 5000 to a dummy telescope

This command starts a stellarium control server listenning at port `5000` connected to a dummy telescope sending commands to `/dev/null`

**Real Nexstar example (Celestron telescopes)**

    $ nts -s stellarium -p 5050 -t nexstar -i /dev/ttyS0
    Remote stellarium control server running at port 5050 to a dummy telescope

This command starts a stellarium control server listenning at port `5050` connected to a [Nexstar](http://www.nexstarsite.com/ "Nexstar Protocol") telescope sending commands to `/dev/ttyS0` device

**Multiple servers**

    $ nts -c config.json
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
  , "telescope-device": "/dev/ttyS0"
  , "telescope-type": "nextar"
  , "camera-device": "/dev/null"

  , "enabled": false
  }
]
```

## Setup your own homemade planetarium

**Overview**

This is a small tutorial to connect [Stellarium](http://www.stellarium.org/ "Stellarium software") with a Celestron telescope, and control it remotly. The next diagram describes all the required elements to build your own homemade planetarium.

![](https://www.lucidchart.com/documents/download/51156cc1-d020-4104-b035-73300a000fde)

**Requirements**

- RaspberryPi with [raspbian](http://www.raspbian.org/ "Debian distribution for your RaspberryPi") installed
- A Ethernet wire or a [Wireless adaptor](http://www.raspberrypi-tutorials.co.uk/set-raspberry-pi-wireless-network/) for your Raspberry Pi
- Telescope Celestron (Nexstar Protocol) with GoTo feature
- USB to Serial port adaptor
- A computer with [Stellarium](http://www.stellarium.org/ "Stellarium software") installed

**Steps**

First of all you should connect your RaspberryPi to a router with a Ethernet wire. As an alternative, you can connect the Raspberry with one wireless adaptor but that is outside the scope of this tutorial. Then connect by SSH.

    $ ssh 192.168.1.15

The first step is to install the nodejs and npm packages:

    pi@raspberry $ sudo apt-get install nodejs npm

First verify that the current nodejs and npm packages have compatible versions:

    pi@raspberry $ node -v
    0.8.9
    pi@raspberry $ npm -v
    1.1.4

If the previous commands have returned older versions you should install node and npm manualy:

    pi@raspberry $ wget http://www.nodejs.org/...
    pi@raspberry $ tar zxf node-0.8.9.tar.gz
    pi@raspberry $ cd node-0.8.9
    pi@raspberry $ ./configure && make
    pi@raspberry $ sudo make install
    pi@raspberry $ node -v
    0.8.9
    pi@raspberry $ npm -v
    1.1.4

Then install the node-telescope-server module in your Raspberry running:

    pi@raspberry $ sudo npm install node-telescope-server -g

Then connect your USB to Serial port adaptor to one of your available ports in the Raspberry Pi and connect the other side to the telescope. Run the next `lsusb` command to identify the USB device to be initialized:

    pi@raspberry $ lsusb
    ...
    Bus 001 Device 002: ID 4358:2523
    ...
    pi@raspberry $ sudo modprobe usbserial vendor=0x4358 product=0x2523

Run `dmesg` command and you shall see lines like these:

    pi@raspberry $ dmesg
    usbserial_generic 1-1:1.0: generic converter detected
    usb 1-1: generic converter now attached to ttyUSB0
    usbcore: registered new interface driver usbserial_generic

Identify the device uid assigned by the kernel to the serial port, aka `ttyUSB0`.

Then start a nts instance to control your telescope. You should specify `-t` and `-i` arguments with your telescope type and file to the device file descriptor.

    pi@raspberry $ nts -s stellarium -p 5000 -t nexstar -i /dev/ttyS0
    Remote stellarium control server running at port 5000 to a nextar telescope

Now the Node Telescope Server (nts) is ready to receive instructions to move your telescope to the desired target.

The next step is to connect this nts instance with the Stellarium software. Open Stellarium and press `Ctrl+0` or go to the telescopes window. Add a new telescope and choose the "External software or remote computer". Then choose a desired name for your telescope, for example "NodeJS-RaspberryPI". Then specify the ip assigned to the RaspberryPI and the port listening by nts instance, in my case 192.168.1.15 and 5000. Save the telescope configuration.

The last step is to click on connect button and the status label should change to "Connected".

Finally you have the Stellarium connected to your telescope! Choose the desired object and pres the `Ctrl+1` and realize that the telescope start pointing to the target. :-)

Enjoy it!

## License

Check the `LICENSE` file



