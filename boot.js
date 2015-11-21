var os = require('os');
var lcd = require('jsupm_i2clcd');

var myLcd = new lcd.Jhd1313m1(0, 0x3E, 0x62);

myLcd.setCursor(0,0);
myLcd.setColor(53, 39, 249);
myLcd.write(os.hostname().slice(-1) + ': ' + os.networkInterfaces().wlan0[0].address);