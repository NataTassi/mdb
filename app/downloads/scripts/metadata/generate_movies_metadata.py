#!/usr/bin/python3
import os
import metadata_generator
from utils import tmdb, traverse_movies


def generate_movie_metadata(movie_path: str, movie_dir: str, movie_name: str, film_series: str):
    """ Generate movie metadata in the movie dir if it doesn't exist already. """

    json_filepath = os.path.join(movie_path, movie_name + ' metadata.json')
    poster_filepath = os.path.join(movie_path, movie_name + ' poster.jpg')

    if not os.path.isfile(json_filepath) or not os.path.isfile(poster_filepath):
        os.chdir(movie_path)
        print(f"(!) '{movie_dir}': generating metadata...", flush=True)

        release_year = int(traverse_movies.extract_year(movie_dir))

        if metadata_generator.generate_movie_metadata(movie_name, release_year, \
            film_series, poster=True):

            print(f"(+) '{movie_dir}': metadata generated", flush=True)
    else:
        print(f"(!) '{movie_dir}': metadata found", flush=True)


if __name__ == '__main__':
    tmdb.check_api_key()
    traverse_movies.visit_movie = generate_movie_metadata
    traverse_movies.traverse_one_offs()
    traverse_movies.traverse_film_series()
