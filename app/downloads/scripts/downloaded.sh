#!/bin/bash
IMDB_ID=`$SCRIPTS_DIR/redi.sh -g "torrent:$TR_TORRENT_NAME" 2>/dev/null`
$SCRIPTS_DIR/log.sh "$IMDB_ID downloaded"
# $SCRIPTS_DIR/subtitles.py $IMDB_ID en