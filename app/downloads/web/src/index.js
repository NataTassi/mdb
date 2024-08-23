const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

import { validImdbID } from './utils/movies.js';
import { ErrorTitle, statusByTitle, extraParams, invalidImdbID } from './utils/error';

const BAD_REQUEST = statusByTitle[ErrorTitle.BAD_REQUEST];
const SCRIPTS_DIR = process.env.SCRIPTS_DIR;
const PORT = 8080;

const app = express();
app.use(cors());

// Endpoints using this parser will process incoming requests with the querystring library instead of the qs library
const downloadBodyParser = bodyParser.urlencoded({ extended: false })

app.get('/status', (req, res) => {
    const {imdb_id: imdbID} = req.query;

    if (!validImdbID(imdbID)) {
        res.status(BAD_REQUEST).send(invalidImdbID());
    }    
    else if (Object.keys(req.query).length != 1) {
        res.status(BAD_REQUEST).send(extraParams());
    }
    else {
        const child = spawn(`${SCRIPTS_DIR}/status.sh`, [`${imdbID}`]);
        child.stdout.on('data', data => res.status(200).send(`${data}`));
        child.stderr.on('data', data => console.log(`status.sh stderr: ${data}`));
    }
});

app.get('/download', downloadBodyParser, (req, res) => {
    const {imdb_id: imdbID} = req.query;

    if (!validImdbID(imdbID)) {
        res.status(BAD_REQUEST).send(invalidImdbID());
    }    
    else if (Object.keys(req.query).length != 1) {
        res.status(BAD_REQUEST).send(extraParams());
    }
    else {
        const child = spawn(`${SCRIPTS_DIR}/add.sh`, [`${imdbID}`]);
        child.stdout.on('data', data => console.log(`add.sh stdout: ${data}`));
        child.stderr.on('data', data => console.log(`add.sh stderr: ${data}`));
        res.status(200).send("OK\n");
    }
});

app.listen(PORT, () => console.log(`Downloads server listening on port ${PORT}, url: http://localhost:${PORT}`))
