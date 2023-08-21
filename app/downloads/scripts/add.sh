#!/bin/bash
IMDB_ID=$1

if [[ `/app/scripts/status.sh $IMDB_ID` != "Not available" ]]; then
    echo "Download already started"
else
    TORRENT_URL=`./torrent_url.py $IMDB_ID`
    echo $TORRENT_URL

    TORRENT_PATH="/torrents/$IMDB_ID.torrent"
    curl -sLo $TORRENT_PATH $TORRENT_URL

    TORRENT_NAME=$(transmission-show $TORRENT_PATH | head -1 | cut -f 2- -d ' ')
    /app/scripts/redis.sh -s "torrent:$TORRENT_NAME" <<< $IMDB_ID
    /app/scripts/redis.sh -s $IMDB_ID <<< "$TORRENT_NAME"

    transmission-remote --auth $TRANSMISSION_USER:$TRANSMISSION_PASS --add $TORRENT_PATH
    echo "$IMDB_ID added with torrent name '$TORRENT_NAME' at $(date --utc '+%F %T')" >> /downloads/log.txt
fi