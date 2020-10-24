#!/bin/sh
# launcher.sh

cd /
cd /home/pi/Projects/video-stream-master
echo "About to sleep"
#sleep 20
echo "Finished sleeping"
while true; do sleep 10 && /usr/bin/npm run serve && break; done
#/usr/local/bin/npm run serve
#exit

