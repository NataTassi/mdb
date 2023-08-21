#!/bin/bash
IMDB_ID=$1
TORRENT_NAME=`/app/scripts/redis.sh -g $IMDB_ID 2>/dev/null`

if [ ! -z "${TORRENT_NAME}" ]; then
    TORRENT_ID=`transmission-remote --auth mdb:mdb -l | grep -F "${TORRENT_NAME}" | awk '{print \$1}'`
    STATUS=`transmission-remote --auth mdb:mdb -t ${TORRENT_ID} --info | grep Percent | awk '{print $NF}'`
else
    STATUS="Not available"
fi

echo $STATUS