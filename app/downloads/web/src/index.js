const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

import { validImdbID } from './utils/movies.js';
import { ErrorTitle, statusByTitle, extraParams, invalidImdbID } from './utils/error.ts';

const BAD_REQUEST = statusByTitle[ErrorTitle.BAD_REQUEST];

const PORT = 8080;

const app = express();
app.use(cors());

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
        const child = spawn('/app/scripts/status.sh', [`${imdbID}`]);
        child.stdout.on('data', data => res.status(200).send(`${data}`));
        child.stderr.on('data', data => console.log(`status.sh stderr: ${data}`));
    }
});

app.post('/download_movie', downloadBodyParser, (req, res) => {
    const imdbID = req.body.imdb_id;

    if (!validImdbID(imdbID)) {
        res.status(BAD_REQUEST).send(invalidImdbID());
    }    
    else if (Object.keys(req.body).length != 1) {
        res.status(BAD_REQUEST).send(extraParams());
    }
    else {
        const child = spawn('/app/scripts/add.sh', [`${imdbID}`]);
        child.stdout.on('data', data => console.log(`add.sh stdout: ${data}`));
        child.stderr.on('data', data => console.log(`add.sh stderr: ${data}`));
        res.status(200).send("OK\n");
    }
});

app.listen(PORT, () => console.log(`Downloads server listening on port ${PORT}!`))
