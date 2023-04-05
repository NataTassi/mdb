import { MOVIES_INDEX, directoryPath, filePrefix, posterPath } from 'model/movies';
import { ParamType, search } from 'model/redis/rediSearch';
import * as spanish from 'model/spanish';


const parameterTypes = {
    'imdb_id' : ParamType.TAG,
    'title' : ParamType.TEXT,
    'plot' : ParamType.TEXT,
    'genre' : ParamType.TAG,
    'release_year_start' : ParamType.RANGE_START,
    'release_year_end' : ParamType.RANGE_END,
    'runtime_start' : ParamType.RANGE_START,
    'runtime_end' : ParamType.RANGE_END,
    'director' : ParamType.TAG,
    'writer' : ParamType.TAG,
    'actor' : ParamType.TAG,
    'film_series' : ParamType.TAG
};

function addSpanishAccents(text: string, accentsArray: number[]) {
    let newText = '';
    const accents = new Set(accentsArray);

    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        
        if (accents.has(i)) {
            c = spanish.vowelToAccentedVowel[c];
        }

        newText += c;
    }

    return newText;
}

function processRedisResults(results) {
    results.documents.forEach((doc, idx) => {
        const movie = doc.value;
        results.documents[idx] = movie;

        const directory = movie.directory; 
        const filmSeries = movie.film_series;
        const dirPath = directoryPath(directory, filmSeries);
        const filePref = filePrefix(directory, filmSeries);
        movie.poster_path = posterPath(dirPath, filePref);

        const title_spanish = movie.title_spanish;
        const title_spanish_accents = movie.title_spanish_accents;
        movie.title_spanish = addSpanishAccents(title_spanish, title_spanish_accents);
        delete movie.title_spanish_accents;

        const plot_spanish = movie.plot_spanish;
        const plot_spanish_accents = movie.plot_spanish_accents;
        movie.plot_spanish = addSpanishAccents(plot_spanish, plot_spanish_accents);
        delete movie.plot_spanish_accents;
    });

    return results;
}

export async function searchMovies(query) {
    return search(MOVIES_INDEX, query, parameterTypes, processRedisResults);
}

export function deleteDirectory(results) {
    for (const movie of results.documents) {
        delete movie.directory;
    }
}

export default async function handler(req, res) {
    const { status, response } = await searchMovies(req.query);
    deleteDirectory(response);
    res.status(status).json(response);
}