import os
import sys
import requests
import subprocess
from utils import downloader

BASE_YTS_URL = 'https://yts.mx/api/v2/movie_details.json'
DEFAULT_QUALITY = '1080p'

TRANSMISSION_USER = os.environ.get("TRANSMISSION_USER")
TRANSMISSION_PASS = os.environ.get("TRANSMISSION_PASS")

def valid_imdb_id(id):
    return (len(id) == 9 or len(id) == 10) and \
        id[:2] == 'tt' and \
        id[2:].isdigit()


def download_movie_info(imdb_id):
    return requests.get(BASE_YTS_URL, params={'imdb_id': imdb_id})


def main():
    with open('/home/nata/Desktop/test.txt', 'w') as f:
        f.write('The script is being called!')

    argc = len(sys.argv)

    if argc != 2 or not valid_imdb_id(sys.argv[1]):
        print(f"Use: {sys.argv[0]} <imdb_id>")
    else:
        if not TRANSMISSION_USER or not TRANSMISSION_PASS:
            print("You must set the TRANSMISSION_USER and TRANSMISSION_PASS env vars")
            sys.exit(0)

        imdb_id = sys.argv[1]

        try:
            response = download_movie_info(imdb_id)

            if response.status_code != 200:
                sys.exit("Movie info request failed with code: " + response.status_code)

            response_data = response.json()
            request_status = response_data['status']

            if request_status != 'ok':
                sys.exit("Movie info request failed with status: " + request_status)

            movie_info = response_data['data']['movie']
            
            torrents = movie_info['torrents']

            url = None
            chosen_quality = None

            for torrent in torrents:
                quality = torrent['quality']

                if not url or quality == DEFAULT_QUALITY:
                    url = torrent['url']
                    chosen_quality = quality

            if url:
                print(f"Downloading torrent for movie with ID {imdb_id} and quality {chosen_quality}")   
                filename = imdb_id + '.torrent'

                if download_file(url, filename):
                    print("Torrent downloaded")

                    res = subprocess.run(
                        f'transmission-remote --auth {TRANSMISSION_USER}:{TRANSMISSION_PASS} --add {filename}', 
                        shell=True, 
                        stdout = subprocess.DEVNULL, 
                        stderr = subprocess.DEVNULL
                    )
                    # os.remove(filename)
                    
                    if res.returncode == 0:
                        print("Torrent added")
                    else:
                        sys.exit("Torrent couldn't be added")
                else:
                    sys.exit("Torrent download failed")
            else:
                sys.exit("No torrent available")

        except requests.exceptions.RequestException:
            sys.exit("Connection error")


if __name__ == '__main__':
    main()