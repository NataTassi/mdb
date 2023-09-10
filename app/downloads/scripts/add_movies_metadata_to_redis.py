#!/usr/bin/python3
import os
import json
from utils import traverse_movies

import redis
from redis.commands.json.path import Path

MOVIES_INDEX_PREFIX = 'movie'

redis_client = redis.Redis()


def add_movie_metadata_to_redis(movie_path: str, movie_dir: str, movie_name: str, film_series: str):
    json_filepath = os.path.join(movie_path, movie_name + ' metadata.json')
    global counter

    with open(json_filepath, 'r', encoding='utf-8') as json_file:
        json_data = json.load(json_file)

        imdb_id = json_data['imdb_id']

        redis_client.json().set(
            f"{MOVIES_INDEX_PREFIX}:{imdb_id}",
            Path.root_path(),
            json_data
        )


if __name__ == '__main__':
    traverse_movies.visit_movie = add_movie_metadata_to_redis
    traverse_movies.traverse_one_offs()
    traverse_movies.traverse_film_series()
    print("Movies metadata added to Redis database")