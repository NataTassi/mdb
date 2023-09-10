#!/usr/bin/python3
import redis
from redis.commands.search.field import TextField, NumericField, TagField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

MOVIES_INDEX = 'movies-idx'
MOVIES_INDEX_PREFIX = 'movie'

redis_client = redis.Redis()

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

indexDefinition = IndexDefinition(
    prefix=[f"{MOVIES_INDEX_PREFIX}:"], 
    index_type=IndexType.JSON
)

try:
    redis_client.ft(MOVIES_INDEX).create_index(
        schema,
        stopwords=[],
        definition=indexDefinition
    )
    print("Movies index created")
    
except redis.exceptions.ResponseError:
    print("Movies index already exists")

