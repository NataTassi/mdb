#!/usr/bin/python3
import os
import json
from utils import traverse_movies

import redis
from redis.commands.json.path import Path
from redis.commands.search.field import TextField, NumericField, TagField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType


MOVIES_INDEX = 'movies-idx'
MOVIES_INDEX_PREFIX = 'movie'

redis_client = redis.Redis()
counter = 1


def create_movies_index():
    schema = (
        NumericField("$.tmdb_id", as_name="tmdb_id"),
        TagField("$.imdb_id", as_name="imdb_id"),
        TextField("$.title", as_name="title"),
        TextField("$.title_spanish", as_name="title_spanish"),
        TagField("$.genres.*", as_name="genre"),
        TagField("$.genres_spanish.*", as_name="genre_spanish"),
        TextField("$.plot", as_name="plot"),
        TextField("$.plot_spanish", as_name="plot_spanish"),
        NumericField("$.release_year", as_name="release_year"),
        NumericField("$.runtime", as_name="runtime"),
        TagField("$.directors.*", as_name="director"),
        TagField("$.writers.*", as_name="writer"),
        TagField("$.cast.*", as_name="actor"),
        TagField("$.film_series", as_name="film_series")
    )

    redis_client.ft(MOVIES_INDEX).create_index(
        schema,
        stopwords=[],
        definition=IndexDefinition(prefix=[f"{MOVIES_INDEX_PREFIX}:"], index_type=IndexType.JSON)
    )


def add_movie_metadata_to_redis(movie_path: str, movie_dir: str, movie_name: str, film_series: str):
    json_filepath = os.path.join(movie_path, movie_name + ' metadata.json')
    global counter

    with open(json_filepath, 'r', encoding='utf-8') as json_file:
        json_data = json.load(json_file)

        redis_client.json().set(
            f"{MOVIES_INDEX_PREFIX}:{str(counter)}",
            Path.root_path(),
            json_data
        )

        counter += 1


if __name__ == '__main__':
    create_movies_index()
    traverse_movies.visit_movie = add_movie_metadata_to_redis
    traverse_movies.traverse_one_offs()
    traverse_movies.traverse_film_series()
