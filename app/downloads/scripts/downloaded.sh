#!/bin/bash
transmission-show $TORRENT_PATH | head -1 | cut -f 2- -d ' '
echo "'$TR_TORRENT_NAME' downloaded in directory '$TR_TORRENT_DIR' at $TR_TIME_LOCALTIME" >> /downloads/log.txt