import { directoryPath, filePrefix, moviePath, subtitlesPaths, validImdbID } from 'model/movies';
import { errorObject, ErrorTitle, statusByTitle, extraParams, invalidImdbID } from 'utils/api';
import { searchMovies } from 'pages/api/search/movies';

const BAD_REQUEST = statusByTitle[ErrorTitle.BAD_REQUEST];

export default async function handler(req, res) {
    const {imdb_id: imdbId} = req.query;

    if (!validImdbID(imdbId)) {
        res.status(BAD_REQUEST).json(invalidImdbID());
    }
    else if (Object.keys(req.query).length != 1) {
        res.status(BAD_REQUEST).json(extraParams());
    }
    else {
        const { status, response } = await searchMovies(req.query);

        if (response.total == 0) {
            res.status(404).json(errorObject(ErrorTitle.NOT_FOUND, 'The movie is not in the database'));
        }
        else {
            const metadata = response.documents[0];
            const directory = metadata.directory; 
            delete metadata.directory;
            const filmSeries = metadata.film_series;
            const dirPath = directoryPath(directory, filmSeries);
            const filePref = filePrefix(directory, filmSeries);
            metadata.movie_path = await moviePath(dirPath, filePref);
            metadata.subtitles_paths = await subtitlesPaths(dirPath, filePref);
            res.status(status).json(metadata);
        }
    }
}