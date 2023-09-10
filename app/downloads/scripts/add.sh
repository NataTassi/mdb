#!/bin/bash
IMDB_ID=$1

MOVIE_STATUS=`$SCRIPTS/status.sh $IMDB_ID`

if [[ ${MOVIE_STATUS} == "Invalid state" ]]; then
    >&2 echo "Invalid state"
elif [[ ${MOVIE_STATUS} != "Not available" ]]; then
    echo "Download already started"
else
    TORRENT_URL=`$SCRIPTS/torrent_url.py $IMDB_ID`
    echo $TORRENT_URL

    TORRENT_PATH="/downloads/torrents/$IMDB_ID.torrent"
    curl -sLo $TORRENT_PATH $TORRENT_URL

    TORRENT_NAME=`transmission-show $TORRENT_PATH | head -1 | cut -f 2- -d ' '`
    $SCRIPTS/redi.sh -s "torrent:$TORRENT_NAME" <<< $IMDB_ID
    $SCRIPTS/redi.sh -s $IMDB_ID <<< "$TORRENT_NAME"

    transmission-remote --auth $TRANSMISSION_USER:$TRANSMISSION_PASS --add $TORRENT_PATH
    $SCRIPTS/log.sh "$IMDB_ID added with torrent name '$TORRENT_NAME'"

    echo "Download started"
fi