#!/usr/bin/python3
import os
import sys
import requests
from utils import imdb, downloader, opensubtitles

OPENSUBTITLES_TOKEN = os.environ.get('OPENSUBTITLES_TOKEN')
LANGUAGES = ['en', 'es']


def search_subtitles(imdb_id, language):
    params = {
        'imdb_id': imdb_id,
        'languages': language,
        'order_by': 'download_count',
        'order_direction': 'desc'
    } 
    return requests.get(opensubtitles.SEARCH_URL, params=params, headers={'Api-Key': opensubtitles.KEY})


def download_subtitles(imdb_id, language):
    search_response = search_subtitles(imdb_id, language) 

    if search_response.status_code != 200:
        sys.exit(f"Subtitles search request failed with code: {search_response.status_code}")

    search_data = search_response.json()

    if search_data['total_count'] == 0:
        print(f"No {language} subtitles available")
    else:
        file_id = search_data['data'][0]['attributes']['files'][0]['file_id']
        data = { 
            'file_id': file_id,
            'sub_format': 'webvtt'
        }
        headers = { 
            'Api-Key': opensubtitles.KEY,
            'Authorization': f"Bearer {OPENSUBTITLES_TOKEN}"
        }
        download_response = requests.post(opensubtitles.DOWNLOAD_URL, data=data, headers=headers)

        if download_response.status_code != 200:
            sys.exit(f"Subtitle download request failed with code: {download_response.status_code}")

        download_data = download_response.json()
        url = download_data['link']

        filename = f"{imdb_id}_{language}.vtt"

        if downloader.download_file(url, filename, '/downloads'):
            print("Subtitle downloaded")
            sys.exit(0) 
        else:
            sys.exit("Subtitle download failed")


def main():
    argc = len(sys.argv)

    if argc != 3 or not imdb.valid_imdb_id(sys.argv[1]) or not sys.argv[2] in LANGUAGES:
        print(f"Use: {sys.argv[0]} <imdb_id> <en|es>")
    else:
        if not OPENSUBTITLES_TOKEN:
            sys.exit("You must set the OPENSUBTITLES_TOKEN env var")

        imdb_id = sys.argv[1]
        language = sys.argv[2]

        try:
            download_subtitles(imdb_id, language)
        except requests.exceptions.RequestException:
            sys.exit("Connection error")


if __name__ == '__main__':
    main()