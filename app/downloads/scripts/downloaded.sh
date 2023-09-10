#!/bin/bash
IMDB_ID=`$SCRIPTS/redi.sh -g "torrent:$TR_TORRENT_NAME" 2>/dev/null`
$SCRIPTS/log.sh "$IMDB_ID downloaded"
# $SCRIPTS/subtitles.py $IMDB_ID en