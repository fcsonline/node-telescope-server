/**
 Exponential buffer extensions
*/

var util = require('util');

module.exports = function (args) {

  function lshift(num, bits) {
    return num * Math.pow(2, bits);
  }

  function rshift(num, bits) {
    return num * Math.pow(2, -bits);
  }

  var buffer = new Buffer(args);

  buffer.readDoubleExponential = function (offset) {
    return  lshift(buffer.readUInt8(offset + 0), 0) +
            lshift(buffer.readUInt8(offset + 1), 8) +
            lshift(buffer.readUInt8(offset + 2), 16) +
            lshift(buffer.readUInt8(offset + 3), 24) +
            lshift(buffer.readUInt8(offset + 4), 32) +
            lshift(buffer.readUInt8(offset + 5), 40) +
            lshift(buffer.readUInt8(offset + 6), 48) +
            lshift(buffer.readUInt8(offset + 7), 56);
  };


  buffer.writeDoubleExponential = function (value, offset) {
    //buffer.writeDoubleLE(value, offset);
    buffer.writeUInt8(value & 0xFF, offset + 0); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 1); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 2); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 3); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 4); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 5); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 6); value = rshift(value, 8);
    buffer.writeUInt8(value & 0xFF, offset + 7); value = rshift(value, 8);
  };

  buffer.write8ByteStringFrom4ByteNumber = function (val, offset) {

    var val0 = 0xFFFFFFFF + val +1;
    var val1 = val0.toString(16).toUpperCase();
    //console.log("val1 hex string is ",val1);

    var len = val1.length;
    //console.log("len is ",len);

    var pad = 8-len;
    var fromindex;
    var destindex;

    if (len<9)
    {
    	 for (destindex=offset; destindex<pad; destindex++)
    	 {
 	      buffer.writeUInt8('0'.charCodeAt(0),destindex);    
    	 }
	     fromindex = 0;
    }
    else
    {
    	 fromindex = 1;
	     destindex = offset;
    }

    for (; destindex < offset + 8; destindex++)
    {
	     buffer.writeUInt8(val1[fromindex].charCodeAt(0),destindex);
	     fromindex++;
    }
  };
  
  return buffer;
};
