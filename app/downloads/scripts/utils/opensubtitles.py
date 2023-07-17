#!/usr/bin/python3
import os
import sys
import requests

BASE_URL = 'https://api.opensubtitles.com/api/v1'
SEARCH_URL = BASE_URL + '/subtitles'
DOWNLOAD_URL = BASE_URL + '/download'
LOGIN_URL = BASE_URL + '/login'

USER = os.environ.get('OPENSUBTITLES_USER')
PASS = os.environ.get('OPENSUBTITLES_PASS')
KEY = os.environ.get("OPENSUBTITLES_KEY")


if not USER or not PASS or not KEY:
    sys.exit("You must set the OPENSUBTITLES_USER, OPENSUBTITLES_PASS and OPENSUBTITLES_KEY env vars")


def get_auth_token():
    payload = {
        "username": USER,
        "password": PASS
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Api-Key": KEY
    }
    response = requests.post(LOGIN_URL, json=payload, headers=headers)

    if response.status_code != 200:
        sys.exit(f"Login request failed with status code {response.status_code}")

    response_data = response.json()

    # print(f"Allowed downloads: {response_data['user']['allowed_downloads']}")
    return response_data['token']


if __name__ == '__main__':
    print(get_auth_token())