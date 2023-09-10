#!/usr/bin/python3
import os
import re
import sys
import requests
from utils import tmdb


API_KEY = os.environ.get("TMDB_API_KEY")
BASE_URL = 'https://api.themoviedb.org/3'
IMAGE_QUALITY = 'w342'
BASE_IMAGE_URL = 'http://image.tmdb.org/t/p/' + IMAGE_QUALITY
SEARCH_MOVIES_URL = BASE_URL + '/search/movie'
MOVIE_DETAILS_URL = BASE_URL + '/movie/'

ENGLISH = 'en-US'
SPANISH = 'es-MX'
LANGUAGE = ENGLISH


def parse_title_and_year(query):
    ''' 
        Returns a tuple with the title and the year. 
        Accepted formats: <Title> or <Title> (<Year>) or <Title> [<Year>].
    '''
    year_regex = r"(\(|\[)(18|19|2[0-9])\d{2}(\)|\])"
    match = re.search(year_regex, query)
    title = query
    year = None

    if match:
        match_str = match.group(0)
        title = query.replace(match_str, '')
        year = match_str[1:-1]

    return title, year


def request_movie(query):
    payload = {
        'api_key' : API_KEY, 
        'language' : LANGUAGE,
        'include_adult': False
    }
    title, year = parse_title_and_year(query)

    if year:
        payload['primary_release_year'] = year

    payload['query'] = title
    return requests.get(SEARCH_MOVIES_URL, params=payload)


def request_movie_details(tmdb_id):
    payload = {'api_key' : API_KEY, 'language' : LANGUAGE}
    return requests.get(MOVIE_DETAILS_URL + str(tmdb_id), params=payload)


def main():
    argc = len(sys.argv)

    if (argc != 2 and argc != 3) or (argc == 3 and not sys.argv[2].isdigit()):
        print(f"Use: {sys.argv[0]} <movie> [<result_number>]")
    else:
        try:
            movie_to_search = sys.argv[1]
            response = request_movie(movie_to_search)
            response.raise_for_status()
            response_data = response.json()
            num_results = response_data['total_results']
            num_movie = int(sys.argv[2])-1 if argc == 3 else 0

            if num_movie < 0 or num_movie >= num_results or num_movie >= 20:
                print("No results")
            else:
                movies = response_data['results']
                movies.sort(reverse=True, key=lambda m : m['vote_count'])
                movie = movies[num_movie]
                tmdb_id = movie['id']

                response = request_movie_details(tmdb_id)
                response.raise_for_status()
                movie_details = response.json()

                imdb_id = movie_details['imdb_id']
                title = movie['title']
                genres = [genre['name'] for genre in movie_details['genres']]
                year = movie['release_date'][:4]
                description = movie['overview']

                runtime = movie_details['runtime']
                hours = runtime // 60
                minutes = runtime % 60
                formatted_runtime = f'{hours}h {minutes:02d}m'

                poster_path = movie['poster_path']
                poster_url = BASE_IMAGE_URL + poster_path

                print('TMDb ID: ' + str(tmdb_id))
                print('IMDb ID: ' + imdb_id)
                print('Title: ' + title)
                print('Genres: ', end='')
                if genres:
                    print(*genres, sep=', ')
                else:
                    print('Not available')
                print('Year: ' + year)
                print('Duration: ' + formatted_runtime)
                print('Description: ' + description)
                print('Poster: ' + ('Not available' if poster_path is None else poster_url))
        except requests.exceptions.RequestException as e:
            raise SystemExit(e)
            

if __name__ == '__main__':
    tmdb.check_api_key()
    main()
