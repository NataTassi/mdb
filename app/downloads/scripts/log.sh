#!/bin/bash
EVENT=$1
echo "$EVENT at $(date -u '+%F %T.%3N')" >> /downloads/log.txt