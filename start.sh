#!/bin/sh
cd /comfort
forever --spinSleepTime 2000 -l /comfort/for.log -e /comfort/err.log -o /comfort/out.log /comfort/edison.js
