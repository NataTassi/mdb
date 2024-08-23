#!/bin/bash
IMDB_ID=$1

MOVIE_STATUS=`$SCRIPTS_DIR/status.sh $IMDB_ID`

if [[ ${MOVIE_STATUS} == "Invalid state" ]]; then
    >&2 echo "Invalid state"
elif [[ ${MOVIE_STATUS} != "Not available" ]]; then
    echo "Download already started"
else
    TORRENT_URL=`$SCRIPTS_DIR/torrent_url.py $IMDB_ID`
    echo $TORRENT_URL

    TORRENT_PATH="/downloads/torrents/$IMDB_ID.torrent"
    curl -sLo $TORRENT_PATH $TORRENT_URL

    if [ -e "$TORRENT_PATH" ]; then
        echo "Torrent downloaded to $TORRENT_PATH"
    else
        >&2 echo "Torrent download failed"
        exit 1
    fi

    TORRENT_NAME=`transmission-show $TORRENT_PATH | head -1 | cut -f 2- -d ' '`

    $SCRIPTS_DIR/redi.sh -s "torrent:$TORRENT_NAME" <<< $IMDB_ID

    if [[ "`$SCRIPTS_DIR/redi.sh -g "torrent:$TORRENT_NAME" 2>/dev/null`" != "$IMDB_ID" ]]; then
        >&2 echo "Failed to save torrent name in Redis"
        exit 1
    fi

    $SCRIPTS_DIR/redi.sh -s $IMDB_ID <<< "$TORRENT_NAME"

    if [[ "`$SCRIPTS_DIR/redi.sh -g $IMDB_ID 2>/dev/null`" != "$TORRENT_NAME" ]]; then
        >&2 echo "Failed to save IMDb id in Redis"
        exit 1
    else
        echo "New Redis key added: \"$IMDB_ID\"=\"$TORRENT_NAME\""
    fi

    if [[ "`transmission-remote --auth $TRANSMISSION_USER:$TRANSMISSION_PASS --add $TORRENT_PATH`" != *success ]]; then
        >&2 echo "Failed to add torrent to Transmission"
        exit 1
    else
        echo "New Redis key added: \"$TORRENT_NAME\"=\"$IMDB_ID\""
    fi

    $SCRIPTS_DIR/log.sh "$IMDB_ID added with torrent name '$TORRENT_NAME'"

    echo "Download started"
fi