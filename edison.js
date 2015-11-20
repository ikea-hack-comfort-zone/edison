/**
 * LIGHT
 */

var groveSensor = require('jsupm_grove');
var http = require('http'), 
       fs = require('fs');

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

var upmMicrophone = require("jsupm_mic");

// Attach microphone to analog port A1
var myMic = new upmMicrophone.Microphone(1);

var threshContext = new upmMicrophone.thresholdContext;

threshContext.averageReading = 0;
threshContext.runningAverage = 0;
threshContext.averagedOver = 2;

var is_running = false;
// Infinite loop, ends when script is cancelled
// Repeatedly, take a sample every 2 microseconds;
// find the average of 128 samples; and
// print a running graph of the averages
// 
function readMic()
{
    var loop = true;

    while(loop)
    {
        var buffer = new upmMicrophone.uint16Array(128);
        var len = myMic.getSampledWindow(2, 128, buffer);

        if (len)
        {
            var thresh = myMic.findThreshold(threshContext, 30, buffer, len);

            readLightSensorValue();

            var return_thresh = '';

            if (thresh)
            {
                return_thresh = thresh;
            }

            return_thresh  = thresh || 0;

            loop = false;
        }
    }
}

// Print message when exiting
process.on('SIGINT', function()
{
    console.log("Exiting...");
    process.exit(0);
});

// Load Grove module
var groveSensor1 = require('jsupm_grove');

// Create the temperature sensor object using AIO pin 2
var temp = new groveSensor1.GroveTemp(2);

// Read the temperature ten times, printing both the Celsius and
// equivalent Fahrenheit temperature, waiting one second between readings
var i = 0;

/**
 * TEMP
 */

function readTemp()
{
        var celsius = temp.value();
        var fahrenheit = celsius * 9.0/5.0 + 32.0;

        return celsius || 0;
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
        'temp':readTemp(),
    };

    sensor_data = JSON.stringify(sensor_data);
});

/**
 *  HTTP SERV
 */

var app = http.createServer(function(req,res)
{
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(sensor_data));
        res.end();
});

app.listen(3000);