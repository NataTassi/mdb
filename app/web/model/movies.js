import { urlExists } from 'utils/url';
import { isInt } from 'utils/number';

const LANGUAGES = ['EN', 'ES'];
export const MOVIES_INDEX = 'movies-idx';
const MOVIE_EXTENSIONS = ['.mp4', '.mkv', '.avi'];


export function directoryPath(directory, filmSeries) {
    let path = '/Movies';

    if (filmSeries == null) {
        path += '/One-offs';
    }
    else {
        path += `/Film series/${filmSeries}`;
    }

    path += `/${directory}`;
    return path;
}

export function filePrefix(directory, filmSeries) {
    let prefix = directory.substring(0, directory.length - 7);

    if (filmSeries != null) {
        return prefix.substring(prefix.indexOf('. ') + 2);
    }

    return prefix;
}

export function posterPath(directoryPath, filePrefix) {
    return `${directoryPath}/${filePrefix} poster.jpg`;
}

export async function moviePath(directoryPath, filePrefix) {
    const pathPrefix = `${directoryPath}/${filePrefix}`;

    for (const extension of MOVIE_EXTENSIONS) {
        const path = pathPrefix + extension;
        if (await urlExists(path)) return path;
    }

    throw `Movie '${filePrefix}' not found`;
}

export async function subtitlesPaths(directoryPath, filePrefix) {
    const pathPrefix = `${directoryPath}/${filePrefix} `;
    const paths = [];

    for (const lang of LANGUAGES) {
        const path = pathPrefix + lang + '.vtt';
        if (await urlExists(path)) paths.push(path);
    }

    return paths;
}

export function validImdbID(id) {
    return typeof id === 'string' && 
        (id.length == 9 || id.length == 10) && 
        id.substring(0, 2) == 'tt' &&
        isInt(id.substring(2));
}