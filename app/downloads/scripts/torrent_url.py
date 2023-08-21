#!/usr/bin/python3
import sys
import requests
from utils import imdb

BASE_YTS_URL = 'https://yts.mx/api/v2/movie_details.json'
DEFAULT_QUALITY = '1080p'

def main():
    argc = len(sys.argv)

    if argc != 2 or not imdb.valid_imdb_id(sys.argv[1]):
        sys.exit(f"Use: {sys.argv[0]} <imdb_id>")
    else:
        imdb_id = sys.argv[1]

        try:
            response = requests.get(BASE_YTS_URL, params={'imdb_id': imdb_id})

            if response.status_code != 200:
                sys.exit(f"Movie info request failed with code: {response.status_code}")

            response_data = response.json()
            request_status = response_data['status']

            if request_status != 'ok':
                sys.exit(f"Movie info request failed with status: {request_status}")

            movie_info = response_data['data']['movie']
            
            torrents = movie_info['torrents']

            url = None

            for torrent in torrents:
                quality = torrent['quality']

                if not url or quality == DEFAULT_QUALITY:
                    url = torrent['url']

            print(url)

        except requests.exceptions.RequestException:
            sys.exit("Connection error")


if __name__ == '__main__':
    main()