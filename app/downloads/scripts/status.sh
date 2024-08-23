#!/bin/bash
IMDB_ID=$1

if [[ `$SCRIPTS_DIR/redi.sh -g movie:$IMDB_ID 2>/dev/null` ==  WRONGTYPE* ]]; then
    STATUS="Available"
else
    TORRENT_NAME=`$SCRIPTS_DIR/redi.sh -g $IMDB_ID 2>/dev/null`

    if [ ! -z "${TORRENT_NAME}" ]; then
        TORRENT_ID=`transmission-remote --auth mdb:mdb -l | grep -F "${TORRENT_NAME}" | awk '{print \$1}'`

        if [ -z ${TORRENT_ID} ]; then
            STATUS="Invalid state"
        else
            STATUS=`transmission-remote --auth mdb:mdb -t ${TORRENT_ID} --info | grep Percent | awk '{print $NF}'`
        fi
    else
        STATUS="Not available"
    fi
fi

echo $STATUS