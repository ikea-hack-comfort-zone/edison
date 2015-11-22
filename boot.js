var os;

function load()
{
    os = require('os');
    if(typeof os === 'object')
    {
        main();
    } else {
        setTimeout(load,1000);
    }
}

function main()
{
    var lcd = require('jsupm_i2clcd');
    var fs = require('fs');
    
    var myLcd = new lcd.Jhd1313m1(0, 0x3E, 0x62);

    var out = '"' + typeof os + '"';
    fs.writeFile('/tmp/boot',out, function(err)
    {
        if(err) {return console.log(err);}
    });


    myLcd.setCursor(0,0);
    myLcd.setColor(53, 39, 249);
    myLcd.write('loading...');
    myLcd.setCursor(0,0);
    myLcd.write(os.hostname().slice(-1) + ': ' + os.networkInterfaces().wlan0[0].address);
}

setTimeout(load,1000);
