import os
import sys
from .constants import LangCode


MOVIE_EXTENTIONS = ['.mp4', '.mkv', '.avi']
SUBTITLES_EXTENSIONS = ['.srt', '.vtt']
FILM_SERIES_DIR = "Film series"
ONE_OFFS_DIR = "One-offs"

film_series_names_es = {}


def get_movies_base_directory() -> str:
    """
    Get the movies base directory. If the directory wasn't set as an env var
    called MOVIES_DIR or if it doesn't exist, an error message will notify you
    and the program will exit.
    """

    movies_dir = os.environ.get('MOVIES_DIR')

    if not movies_dir:
        print("(-) MOVIES_DIR env var not set", file=sys.stderr)
        print(file=sys.stderr)
        print("In Linux:    export MOVIES_DIR=<movies_dir>", file=sys.stderr)
        print("In Windows:  set MOVIES_DIR=<movies_dir>", file=sys.stderr)
        sys.exit()

    movies_dir = os.path.normpath(movies_dir)
    movies_dir = os.path.abspath(movies_dir)

    if not os.path.isdir(movies_dir):
        print(f"(-) '{movies_dir}' is not a directory", file=sys.stderr)
        sys.exit()

    return movies_dir


def remove_year(movie_name_and_year):
    """ Remove '<space> (<year>)' from the end of the string. """
    return movie_name_and_year[:-7]


def extract_year(movie_name_and_year):
    """ Extract year from a string that ends with '<space> (<year>)'. """
    return movie_name_and_year[-5:-1]


def check_name_format_for_movie_files(movie_path: str, movie_dir: str, is_film_series: bool):
    """
    Check the name format for the movie files. Return the movie name if the movie dir name
    is well formatted, None otherwise. A well formatted movie dir should look like:
    '<title> (<release_year>)' for one-off movies, and '<number>. <title> (<release_year>)'
    for film series.
    If the movie is not found (could be absent or with a bad name format) or the subtitles
    files have ill-formatted names, appropiate messages will notify the errors.
    """

    bad_name_format = False
    movie_dir_split = movie_dir.split('. ', 1)

    if is_film_series and (len(movie_dir_split) == 1 or not movie_dir_split[0].isdigit()):
        bad_name_format = True

    elif len(movie_dir) < 8 or movie_dir[-1] != ')' or \
        movie_dir[-7:-5] != ' (' or not extract_year(movie_dir).isdigit:
        bad_name_format = True

    if bad_name_format:
        prefix = '<number>. ' if is_film_series else ''
        print(
            f"(-) '{movie_dir}': bad movie dir name, it should be "
            f"'{prefix}<title> (<release_year>)'",
            flush=True,
            file=sys.stderr
        )
        return None

    movie_name = movie_dir_split[1] if is_film_series else movie_dir
    movie_name = remove_year(movie_name)

    movie_filepath = None

    for extension in MOVIE_EXTENTIONS:
        tmp_filename = movie_name + extension
        tmp_filepath = os.path.join(movie_path, tmp_filename)

        if os.path.isfile(tmp_filepath):
            movie_filepath = tmp_filepath
            break

    if not movie_filepath:
        print(f"(-) '{movie_dir}': movie not found", flush=True, file=sys.stderr)

    for filename in os.listdir(movie_path):
        for extension in SUBTITLES_EXTENSIONS:
            if filename.endswith(extension):
                if filename not in (f"{movie_name} {LangCode.ENGLISH}{extension}", \
                    f"{movie_name} {LangCode.SPANISH}{extension}"):

                    print(f"(-) {movie_dir}: '{filename}' is a bad subtitle name", \
                        flush=True, file=sys.stderr)

    return movie_name


def visit_movie(movie_path: str, movie_dir: str, movie_name: str, film_series: str):
    """
    Code to execute when a movie directory is visited.
    This code is meant to be overrided.
    """
    print(f"{movie_dir} - {movie_name} - {film_series}")


def traverse_movies_dir(movies_path: str, is_film_series: bool):
    """ Traverse movies in the given directory. """

    movies_dir = os.path.basename(movies_path)
    film_series = movies_dir if is_film_series else None

    for file in os.listdir(movies_path):
        filepath = os.path.join(movies_path, file)

        if os.path.isdir(filepath):
            movie_dir = file
            movie_path = filepath
            movie_name = check_name_format_for_movie_files(movie_path, movie_dir, is_film_series)

            if movie_name:
                visit_movie(movie_path, movie_dir, movie_name, film_series)

        elif is_film_series:
            film_series_es_filename = f"{movies_dir} {LangCode.SPANISH}.txt"

            if file == film_series_es_filename:
                film_series_es_filepath = os.path.join(movies_path, film_series_es_filename)

                with open(film_series_es_filepath, 'r', encoding='utf-8') as film_series_es_file:
                    film_series_es = film_series_es_file.read().replace('\n', '')
                    film_series_names_es[film_series] = film_series_es


def traverse_one_offs():
    """ Traverse one-off movies. """

    one_offs_path = os.path.join(MOVIES_DIR, ONE_OFFS_DIR)

    if not os.path.isdir(one_offs_path):
        print(f"(-) {ONE_OFFS_DIR} subdirectory not found", flush=True, file=sys.stderr)
    else:
        traverse_movies_dir(one_offs_path, is_film_series=False)


def traverse_film_series():
    """ Traverse all film series. """

    all_film_series_path = os.path.join(MOVIES_DIR, FILM_SERIES_DIR)

    if not os.path.isdir(all_film_series_path):
        print(f"(-) {FILM_SERIES_DIR} subdirectory not found", flush=True, file=sys.stderr)
    else:
        for film_series_dir in os.listdir(all_film_series_path):
            film_series_path = os.path.join(all_film_series_path, film_series_dir)
            traverse_movies_dir(film_series_path, is_film_series=True)


MOVIES_DIR = get_movies_base_directory()
