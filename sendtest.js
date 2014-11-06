// sendtest.js
//
// LightwaveRF 433MHz interface for Espruino
// 
// Author: Thomas Cannon (mail@thomascannon.net)
// Copyright (C) 2014 Thomas Cannon

var tx = A0; // Connect to 433Mhz transmitter data pin
var encode = [0x7A,0x76,0x75,0x73,0x6E,0x6D,0x6B,0x5E,0x5D,0x5B,0x57,0x3E,0x3D,0x3B,0x37,0x2F];

function sendBits(bitStream) {
  var p=digitalPulse;
  p(tx,1,0.25); // start bit
  p(tx,0,0.25);
  bitStream.forEach(function(b) {
    p(tx,1,0.25);
    p(tx,0,b?0.25:1.25);
  });
  p(tx,1,0.25); // stop bit
}

function sendMsg(msg) {
  var bitStream = [];
  var repeat = 12;

  msg.forEach(function(nibble) {
    for (var i = 6; i >= 0; i--) { // get last 7 bits of each encoded byte
      bitStream.push(encode[nibble] & (1<<i)?1:0);
    }
  });

  // signal length of (start bit + stop bit) + bitStream
  var sigLength = 0.75 + bitStream.reduce(function(a,b){return a+(b?0.5:1.5);},0);

  var interval = setInterval(function() {
    sendBits(bitStream);
    if (repeat-- == 1) clearInterval(interval);
  }, sigLength + 10.25); // delay 10250us between repeats
}

var on = [0x0,0x0,0xF,0x1,0xA,0xB,0xC,0xD,0xE,0xF];
var off =[0x0,0x0,0xF,0x0,0xA,0xB,0xC,0xD,0xE,0xF];

var socketOn = false;
setWatch(function() {
  socketOn = !socketOn;
  sendMsg(socketOn ? on : off);
}, BTN1, { repeat:true, edge:"rising", debounce:10 });
