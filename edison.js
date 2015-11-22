var os;

function load()
{
    os = require('os');
    if(typeof os === 'object')
    {
        main();
    } else {
        setTimeout(load, 1000);
    }
}


function main()
{
        /**
     * LIGHT
     */
    os = require('os');
    var fs = require('fs');
    fs.writeFile('/tmp/boot',typeof os, function(err)
    {
        if(err) {return console.log(err);}
    });

    var start = (new Date()).toLocaleTimeString();

    var groveSensor = require('jsupm_grove');
    var os = require('os');
    var request = require('request');
    var lcd = require('jsupm_i2clcd');

    var myLcd = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    myLcd.setColor(0, 255, 0);

    var interval = 1000;
    var host = '128.199.60.134:3000';
    var soundArray = [];
    var soundWindowSec = 3;
    var soundResolution = 20; //measurements per second
    var soundPerLoop = soundResolution * interval * 0.001;
    var soundMaxArray = soundWindowSec * (1000 / interval);

    // Create the light sensor object using AIO pin 0
    var light = new groveSensor.GroveLight(0);

    // Read the input and print both the raw value and a rough lux value,
    // waiting one second between readings
    function readLightSensorValue()
    {
        return light.raw_value() || 0;
    }

    /**
     * MIC
     */
    var mraa = require('mraa');
    var apio1 = new mraa.Aio(1);
    var soundIndex = 0;

    function senseMic()
    {
        var aValue = apio1.read();
        if(soundArray.length < soundMaxArray)
        {
            soundArray.push(aValue);
        } else {
            soundArray[soundIndex] = aValue;
        }
        soundIndex = (soundIndex + 1) % soundMaxArray; //measurements to average over
    }

    function readMic()
    {
        var arraySum = soundArray.reduce(function(prev, curr, index) {
            return prev + curr;
        }, 0); 
        return arraySum / soundArray.length;
    }

    // Print message when exiting
    process.on('SIGINT', function()
    {
        console.log('Exiting...');
        process.exit(0);
    });

    // Load Grove module
    var groveSensor1 = require('jsupm_grove');

    // Create the temperature sensor object using AIO pin 2
    var temp = new groveSensor1.GroveTemp(2);

    /**
     * TEMP
     */

    function readTemp()
    {
        return temp.value() || 0;
    }


    /**
     *  DATA GATHER INTERVAL
     */

    var loopCount = 0;

    function loop()
    {
        senseMic();
        if(loopCount === 0)
        {
            send();
        }
        loopCount = (loopCount + 1) % soundPerLoop;
        setTimeout(loop, interval/soundPerLoop);
    }

    function send()
    {
        var sensor_data = {};

        sensor_data = {
            'sensor':os.hostname().slice(-1),
            'light':readLightSensorValue(),
            'sound':readMic(),
            'temp':readTemp()
        };
        //console.log(sensor_data);
        var options =  {
            uri: 'http://' + host + '/api/submit',
            method: 'POST',
            json: sensor_data
        };

        myLcd.clear();
        myLcd.setCursor(0,0);
        myLcd.write(os.hostname().slice(-1) + ': ' + os.networkInterfaces().wlan0[0].address);
        myLcd.setCursor(1,0);
        myLcd.write(start);

        request(options, function(err, res, body) 
        {
            if(err) {console.log(err);}
        });
    }

    loop();
}

setTimeout(load, 1000);