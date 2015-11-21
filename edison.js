/**
 * LIGHT
 */

var groveSensor = require('jsupm_grove');
var os = require('os');
var request = require('request');

var interval = 5000;
var host = '128.199.60.134:3000';

// Create the light sensor object using AIO pin 0
var light = new groveSensor.GroveLight(0);

// Read the input and print both the raw value and a rough lux value,
// waiting one second between readings
function readLightSensorValue()
{
    return light.raw_value() || 0;

    //console.log(light.name() + " raw value is " + light.raw_value() +
    //        ", which is roughly " + light.value() + " lux");
}

/**
 * MIC
 */

var upmMicrophone = require('jsupm_mic');

// Attach microphone to analog port A1
var myMic = new upmMicrophone.Microphone(1);

var threshContext = new upmMicrophone.thresholdContext;

threshContext.averageReading = 0;
threshContext.runningAverage = 0;
threshContext.averagedOver = 2;

function readMic()
{
    var loop = true;
    var return_thresh = '';

    while(loop)
    {
        var buffer = new upmMicrophone.uint16Array(128);
        var len = myMic.getSampledWindow(2, 128, buffer);

        if (len)
        {
            var thresh = myMic.findThreshold(threshContext, 30, buffer, len);

            readLightSensorValue();

            if (thresh)
            {
                return_thresh = thresh;
            }

            return_thresh  = thresh || 0;

            loop = false;
        }
    }

    return return_thresh;
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

var sensor_data = {};

setInterval(function()
{
    sensor_data = {
        'light':readLightSensorValue(),
        'sound':readMic(),
        'temp':readTemp()
    };

    sensor_data = JSON.stringify(sensor_data);
});

function loop()
{
    sensor_data = {
        'sensor':os.hostname().slice(-1),
        'light':readLightSensorValue(),
        'sound':readMic(),
        'temp':readTemp()
    };
    var options =  {
        uri: host + '/api/submit',
        method: 'POST',
        json: sensor_data
    };

    request(options, function(err, res, body) 
    {
        if(err) {console.log(err);}
        if(res) {console.log(res);}
        if(body) {console.log(body);}
    });
    setTimeout(loop, interval);
}

loop();