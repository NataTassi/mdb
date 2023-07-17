#!/bin/bash
REDIS_CMD="get 'torrent:$TR_TORRENT_NAME'"
IMDB_ID=$(exec 3<>/dev/tcp/db/6379 && echo -e "$REDIS_CMD\r\nquit\r\n" >&3 && head -2 <&3 | tail -1)
# /app/scripts/get_subtitles.py $IMDB_ID en
# echo "'$TR_TORRENT_NAME' downloaded in directory '$TR_TORRENT_DIR' at $TR_TIME_LOCALTIME" >> /downloads/log.txt