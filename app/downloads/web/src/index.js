const cors = require('cors');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

import { validImdbID } from './utils/movies.js';
import { buildURL, downloadFile } from './utils/web.js';
import { errorObject, ErrorTitle, statusByTitle } from './utils/error.ts';

const PORT = 8080;
const DEFAULT_QUALITY = '1080p';
const BASE_YTS_URL = 'https://yts.mx/api/v2/movie_details.json';

const app = express();
app.use(cors());

const downloadBodyParser = bodyParser.urlencoded({ extended: false })

app.get('/status', (req, res) => {
    res.send("Feeling really good man");
});

app.post('/download_movie', downloadBodyParser, (req, res) => {
    const imdbID = req.body.imdb_id;

    if (!validImdbID(imdbID)) {
        res.status(statusByTitle[ErrorTitle.BAD_REQUEST]).json(errorObject(ErrorTitle.BAD_REQUEST, 'Invalid IMDb ID'));
    }    
    else if (Object.keys(req.body).length != 1) {
        res.status(statusByTitle[ErrorTitle.BAD_REQUEST]).json(errorObject(ErrorTitle.BAD_REQUEST, 'Unrecognized extra parameters'));
    }
    else {
        const metadataUrl = buildURL(BASE_YTS_URL, { imdb_id: imdbID });

        https.get(metadataUrl, res => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const response = JSON.parse(Buffer.concat(data).toString());
                const movieInfo = response.data.movie;
                const torrents = movieInfo.torrents;

                let torrentUrl;
                let chosenQuality;

                for (const torrent of torrents) {
                    const quality = torrent.quality;

                    if (!torrentUrl || quality === DEFAULT_QUALITY) {
                        torrentUrl = torrent.url;
                        chosenQuality = quality;
                    }
                }

            if (torrentUrl) {
                console.log(`Downloading torrent for movie with ID ${imdbID} and quality ${chosenQuality}`)   
                const torrentPath = `/torrents/${imdbID}.torrent`;

                downloadFile(torrentUrl, torrentPath).then(
                    () => {
                        console.log(`Torrent for movie with ID ${imdbID} downloaded`);
                        const child = spawn('env', [`IMDB_ID=${imdbID}`, '/app/scripts/add.sh']);
                        child.stdout.on('data', data => console.log(`add.sh stdout: ${data}`));
                        child.stderr.on('data', data => console.log(`add.sh stderr: ${data}`));
                    },
                    error => console.error(error)
                );
            }
            });

        }).on('error', error => console.error(error));

        res.status(200).send("Download started\n");
  }
})

app.listen(PORT, () => console.log(`Downloads server listening on port ${PORT}!`))
