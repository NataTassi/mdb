#!/bin/bash
TORRENT_PATH="/torrents/$IMDB_ID.torrent"
TORRENT_NAME=$(transmission-show $TORRENT_PATH | head -1 | cut -f 2- -d ' ')
REDIS_CMD="set 'torrent:$TORRENT_NAME' $IMDB_ID"
exec 3<>/dev/tcp/db/6379 && echo -e "$REDIS_CMD\r\nquit\r\n" >&3 && head -n -1 <&3
transmission-remote --auth $TRANSMISSION_USER:$TRANSMISSION_PASS --add $TORRENT_PATH
echo "$IMDB_ID added with torrent name '$TORRENT_NAME' at $(date --utc '+%F %T')" >> /downloads/log.txt