#!/usr/bin/env python3
import os
import sys
import json
import requests
from utils import downloader, tmdb


TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
BASE_URL = 'https://api.themoviedb.org/3'
IMAGE_QUALITY = 'w342'
BASE_IMAGE_URL = 'http://image.tmdb.org/t/p/' + IMAGE_QUALITY
SEARCH_MOVIES_URL = BASE_URL + '/search/movie'
MOVIE_DETAILS_URL = BASE_URL + '/movie/'

WRITERS = {'Screenplay', 'Writer', 'Story', 'Novel', 'Comic Book'}

ACCENTED_VOWEL_TO_VOWEL = {
    'á' : 'a',
    'é' : 'e',
    'í' : 'i',
    'ó' : 'o',
    'ú' : 'u',
    'Á' : 'A',
    'É' : 'E',
    'Í' : 'I',
    'Ó' : 'O',
    'Ú' : 'U'
}

def get_movie(movie_name: str, release_year: int):
    """
    Search the given movie query in TMDb and get the primary information
    of the best result. If the movie is not found, None is returned.
    """

    payload = {'api_key' : TMDB_API_KEY}
    payload['query'] = movie_name
    payload['primary_release_year'] = release_year

    response = requests.get(SEARCH_MOVIES_URL, params=payload)
    response.raise_for_status()
    response_data = response.json()
    num_results = response_data['total_results']

    if num_results == 0:
        return None

    movies = response_data['results']
    movies.sort(reverse=True, key=lambda m : m['vote_count'])
    return movies[0]


def get_movie_details(movie_id, spanish=False):
    """ Get detailed movie information from TMDb. """

    payload = {'api_key' : TMDB_API_KEY}

    if spanish:
        payload['language'] = 'es-MX'

    response = requests.get(MOVIE_DETAILS_URL + str(movie_id), params=payload)
    response.raise_for_status()
    return response.json()


def get_movie_credits(movie_id):
    """ Get movie cast and crew information from TMDb. """

    payload = {'api_key' : TMDB_API_KEY}
    response = requests.get(MOVIE_DETAILS_URL + str(movie_id) + '/credits', params=payload)
    response.raise_for_status()
    return response.json()


def get_movie_trailers(movie_id):
    """ Get movie trailers from TMDb. """

    payload = {'api_key' : TMDB_API_KEY}
    response = requests.get(MOVIE_DETAILS_URL + str(movie_id) + '/videos', params=payload)
    response.raise_for_status()
    return response.json()


def add_credits_to_metadata(metadata: dict, tmdb_id: int):
    """ Add directors, writers and cast to the metadata dictionary. """

    movie_credits = get_movie_credits(tmdb_id)

    directors = []
    writers_set = set()
    crew = movie_credits['crew']

    for member in crew:
        job = member['job']

        if job == 'Director':
            directors.append(member['name'])
        elif job in WRITERS:
            writers_set.add(member['name'])

    writers = list(writers_set)

    cast_dict = movie_credits['cast']

    if len(cast_dict) > 10:
        cast_dict = cast_dict[:10]

    cast = [actor['name'] for actor in cast_dict]

    metadata['directors'] = directors
    metadata['writers'] = writers
    metadata['cast'] = cast


def add_trailers_to_metadata(metadata: dict, tmdb_id: int):
    """ Add YouTube trailers and teasers to the metadata dictionary. """

    movie_videos = get_movie_trailers(tmdb_id)
    yt_video_ids = []

    for video in movie_videos['results']:
        if video['site'] == 'YouTube' and \
            (video['type'] == 'Teaser' or video['type'] == 'Trailer'):
            yt_video_ids.append(video['key'])

    metadata['yt_video_ids'] = yt_video_ids


def generate_json_file(movie_name: str, metadata: dict):
    """
    Generate a JSON file called "<movie_name> metadata.json" in the current
    directory with the given metadata in a human-readable format.
    """
    with open(movie_name + ' metadata.json', 'w', encoding='utf-8') as file:
        json.dump(metadata, file, ensure_ascii=False, indent=4)


def download_poster(movie_name: str, poster_path: str):
    """
    Download movie poster in the current directory as
    "<movie_name> poster.<image_extension>".
    """
    poster_url = BASE_IMAGE_URL + poster_path
    poster_extension = poster_url.rsplit('.', 1)[-1]
    poster_name = f"{movie_name} poster.{poster_extension}"
    downloader.download_file(poster_url, poster_name)


def generate_movie_metadata(movie_name: str, release_year: int, film_series: str, poster: bool):
    """
    Generate a file called "<title> metadata.json" in the current dir containing
    the metadata described in the table below. And optionally download the movie
    poster in the current dir as "<title> poster.<image_extension>" in English
    and Spanish.

    | Field                 | Type          | Description                                  |
    |-----------------------|---------------|----------------------------------------------|
    | tmdb_id               | int           | TMDb movie ID                                |
    | imdb_id               | string        | IMDb movie ID                                |
    | title                 | string        | Original title                               |
    | title_spanish         | string        | Title in Spanish (without accents)           |
    | title_spanish_accents | array[int]    | Positions of accents in the title in Spanish |
    | genres                | array[string] | List of genres the movie belongs to          |
    | genres_spanish        | array[string] | List of genres in Spanish                    |
    | plot                  | string        | Plot of the movie                            |
    | plot_spanish          | string        | Plot in Spanish (without)                    |
    | plot_spanish_accents  | array[int]    | Positions of accents in the plot in Spanish  |
    | release_date          | date          | Original release date (YYYY-MM-DD)           |
    | runtime               | int           | Length in minutes                            |
    | directors             | array[string] | List of directors                            |
    | writers               | array[string] | List of writers                              |
    | cast                  | array[string] | Cast members                                 |
    | yt_video_ids          | array[string] | List of YouTube video IDs                    |
    | film_series*          | int           | Name of the film series                      |

    Note: field names suffixed with an asterisk are optional.

    Args:
        movie_name (str): movie to search
        release_year (int): movie release year in USA
        film_series_id (str): film series the movie belongs to or None if it's a one-off movie
        poster (bool): if set to True, the poster will be downloaded in the current dir

    Returns:
        True if the metadata could be generated, False otherwise
    """

    try:
        movie = get_movie(movie_name, release_year)

        if movie is None:
            print(f"(-) {movie_name} ({release_year}): not found in the database",
                flush=True, file=sys.stderr)

            return False

        tmdb_id = movie['id']
        movie_details = get_movie_details(tmdb_id)
        movie_details_spanish = get_movie_details(tmdb_id, spanish=True)

        title_spanish = ''
        title_spanish_accents = []

        for idx, char in enumerate(movie_details_spanish['title']):
            if char in ACCENTED_VOWEL_TO_VOWEL:
                char = ACCENTED_VOWEL_TO_VOWEL[char]
                title_spanish_accents.append(idx)

            title_spanish += char

        plot_spanish = ''
        plot_spanish_accents = []

        for idx, char in enumerate(movie_details_spanish['overview']):
            if char in ACCENTED_VOWEL_TO_VOWEL:
                char = ACCENTED_VOWEL_TO_VOWEL[char]
                plot_spanish_accents.append(idx)

            plot_spanish += char

        metadata = {
            'directory' : os.path.basename(os.getcwd()),
            'tmdb_id' : tmdb_id,
            'imdb_id' : movie_details['imdb_id'],
            'title' : movie['title'],
            'title_spanish' : title_spanish,
            'title_spanish_accents' : title_spanish_accents,
            'genres' : [genre['name'] for genre in movie_details['genres']],
            'genres_spanish' : [genre['name'] for genre in movie_details_spanish['genres']],
            'plot' : movie['overview'],
            'plot_spanish' : plot_spanish,
            'plot_spanish_accents' : plot_spanish_accents,
            'release_date' : movie['release_date'],
            'release_year' : int(movie['release_date'][:4]),
            'runtime' : movie_details['runtime']
        }

        add_credits_to_metadata(metadata, tmdb_id)
        add_trailers_to_metadata(metadata, tmdb_id)

        if film_series:
            metadata['film_series'] = film_series

        generate_json_file(movie_name, metadata)

        if poster:
            download_poster(movie_name, movie['poster_path'])

        return True

    except requests.exceptions.ConnectionError:
        print(f"(-) {movie_name} ({release_year}): Connection Error", flush=True, file=sys.stderr)

    except requests.exceptions.Timeout:
        print(f"(-) {movie_name} ({release_year}): Timeout", flush=True, file=sys.stderr)

    except requests.exceptions.RequestException as err:
        print(f"(-) {movie_name} ({release_year}): {err}", flush=True, file=sys.stderr)

    return False


if __name__ == '__main__':
    tmdb.check_api_key()

    args = sys.argv

    if len(args) != 3 or not args[2].isdigit():
        print(f"Usage: {args[0]} <movie> <year>")
    else:
        movie = args[1]
        year = int(args[2])
        generate_movie_metadata(movie, year, None, True)
