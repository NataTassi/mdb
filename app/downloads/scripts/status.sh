#!/bin/bash
REDIS_CMD="get $IMDB_ID"
TORRENT_NAME=`exec 3<>/dev/tcp/db/6379 && echo -e "$REDIS_CMD\r\nquit\r\n" >&3 && head -2 <&3 | tail -1 | sed s/$'\r'//g`

if [[ "$TORRENT_NAME" != "+OK" ]]; then
    TORRENT_ID=`transmission-remote --auth mdb:mdb -l | grep -F "${TORRENT_NAME}" | awk '{print \$1}'`
    STATUS=`transmission-remote --auth mdb:mdb -t ${TORRENT_ID} --info | grep Percent | awk '{print $NF}'`
else
    STATUS="Not available"
fi

echo $STATUS

# https://stackoverflow.com/questions/43963118/concatenation-of-strings-in-bash-results-in-substitution