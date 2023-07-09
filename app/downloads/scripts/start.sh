#!/bin/bash
TRANSMISSION_PATH="/var/lib/transmission-daemon/.config"
chown -R debian-transmission:debian-transmission $TRANSMISSION_PATH
chmod -R 775 $TRANSMISSION_PATH 
service transmission-daemon start
npm run start:dev