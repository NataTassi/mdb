#!/bin/bash
log_level=$1
event=$2

case $log_level in
  "WARN"|"INFO"|"ERROR")
    : # Do nothing
    ;;
  *)
    >&2 echo "Log level is invalid, defaulting to INFO"
    log_level="INFO"
    ;;
esac

timestamp=$(date -u +"%Y-%m-%d %H:%M:%S.%3N")
printf "%s %5s - %s\n" "$timestamp" "$log_level" "$event" | tee -a /downloads/log.txt