#!/usr/bin/env python3
import os
import sys
import base64
import zipfile
import requests
from bs4 import BeautifulSoup

BASE_URL = 'https://yts-subs.com'

class bcolors:
    OKGREEN = '\033[92m'
    OKCYAN = '\033[96m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'


def info_text(text):
    return f"{bcolors.OKCYAN}{text}{bcolors.ENDC}"


def success_text(text):
    return f"{bcolors.OKGREEN}{text}{bcolors.ENDC}"


def error_text(text):
    return f"{bcolors.FAIL}{text}{bcolors.ENDC}"


def error(msg):
    """ Print an error message and exit the program """
    sys.exit(error_text(msg))


def delete_file(filepath):
	try:
		os.remove(filepath)
	
		if not os.path.exists(filepath):
			print(success_text(f"File '{filepath}' deleted"))
			return True
		else:
			print(error_text(f"File '{filepath}' could not be deleted"))
			return False
	except FileNotFoundError:
		error(f"File '{filepath}' does not exist")
	except PermissionError:
		error(f"Permission denied: '{filepath}' could not be deleted")
	except Exception as e:
		error(f"An error occurred: {e}")


def rename_file(old_filename, new_filename):
    try:
        os.rename(old_filename, new_filename)
        if os.path.exists(old_filename):
            print(error_text(f"Failed to rename '{old_filename}' to '{new_filename}'"))
        else:
            print(success_text(f"Renamed '{old_filename}' to '{new_filename}' successfully"))
    except OSError as e:
        print(error_text(f"Error renaming '{old_filename}' to '{new_filename}': {e}"))


def get_download_page_urls(imdb_id):
    """ Get the download page URLs for the English and Spanish subtitles from YTS Subs """

    url = f"{BASE_URL}/movie-imdb/{imdb_id}"
    
    print(info_text(f"Retrieving webpage: {url}"))
    print(info_text("IMDb ID: " + imdb_id))
    response = requests.get(url)
    if response.status_code != 200:
        error("Failed to retrieve webpage")
        return None, None
    
    soup = BeautifulSoup(response.content, 'html.parser')

    movie_title = soup.find(class_='movie-main-title')

    if movie_title:
        print(info_text(f"Movie title: {movie_title.text.strip()}"))
    else:
        print(error_text("Movie title not found"))
    
    tbody = soup.find('tbody')
    if not tbody:
        error("No table body found")
        return None, None
    
    english_url = None
    spanish_url = None
    best_english_rating = -1
    best_spanish_rating = -1
    
    for row in tbody.find_all('tr'):
        columns = row.find_all('td')
        if len(columns) != 5:
            error("The columns in the table are no longer 5")
        
        language_spans = columns[1].find_all('span')
        if len(language_spans) != 2:
            error("The language spans are no longer 2")
        language = language_spans[1].text.strip().lower()
        
        rating_span = columns[0].find('span')
        if rating_span:
            try:
                rating = int(rating_span.text.strip())
            except ValueError:
                error("Rating is not an integer")
        else:
            rating = 0
        
        link_tag = columns[2].find('a')
        if link_tag:
            href = link_tag['href']
        else:
            error("No link to download page found")
        
        if language == 'english' and rating > best_english_rating:
            best_english_rating = rating
            english_url = BASE_URL + href
        elif language == 'spanish' and rating > best_spanish_rating:
            best_spanish_rating = rating
            spanish_url = BASE_URL + href
    
    return english_url, spanish_url


def download_and_extract_subtitle(language, download_page_url):
    """ Download and extract the subtitle from the given YTS Subs download page """
    
    print(info_text(f"Retrieving {language} download page..."))
    response = requests.get(download_page_url)
    if response.status_code != 200:
        print(error_text(f"Failed to retrieve download page: {download_page_url}"))
        return False
    
    soup = BeautifulSoup(response.content, 'html.parser')
    download_button = soup.find(id="btn-download-subtitle")
    if not download_button:
        error("No download button found")
    
    data_link = download_button.get('data-link')
    if not data_link:
        error("No data-link attribute found in the download button")
    
    subtitle_download_url = base64.b64decode(data_link).decode('utf-8')
    
    print(info_text(f"Downloading {language} subtitle from '{subtitle_download_url}'..."))
    zip_response = requests.get(subtitle_download_url)
    if zip_response.status_code != 200:
        print(error_text(f"Failed to download subtitle: '{subtitle_download_url}'"))
        return False
    
    zip_filename = subtitle_download_url.split('/')[-1]
    
    try:
        with open(zip_filename, 'wb') as zip_file:
            zip_file.write(zip_response.content)

        try:
            print(info_text(f"Extracting {language} subtitle..."))
            with zipfile.ZipFile(zip_filename, 'r') as zip_ref:
                zip_ref.extractall('.')
        except zipfile.BadZipFile:
            print(error_text(f"'{zip_filename}' is not a valid ZIP file"))
        finally:
            if os.path.exists(zip_filename):
                print(success_text(f"Downloaded and extracted {language} subtitle successfully"))
                print(info_text(f"Deleting '{zip_filename}'..."))
                delete_file(zip_filename)
                return True
    except IOError as e:
        print(error_text(f"I/O error({e.errno}): {e.strerror}"))
        if os.path.exists(zip_filename):
            print(info_text(f"Deleting '{zip_filename}'..."))
            delete_file(zip_filename)

    return False

        
def rename_subtitle_file(imdb_id, language):
    """ Rename the downloaded subtitle file to match the IMDb ID """

    print(info_text(f"Renaming {language} subtitle..."))
    lang_code = 'en' if language == 'English' else 'es'

    for filename in os.listdir('.'):
        extension = filename.split('.')[-1]

        if f'-{language}.' in filename:
            new_filename = f"{imdb_id}-{lang_code}.{extension}"
            rename_file(filename, new_filename)


def process_language(imdb_id, language, download_page_url):
    """ Process the subtitle for the given language """

    print(info_text(f"Processing {language} subtitle..."))

    if download_page_url:
        if download_and_extract_subtitle(language, download_page_url):
            rename_subtitle_file(imdb_id, language)
    else:
        print(error_text(f"No {language} subtitle available"))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <imdb_id>")
        print(f"Example: {sys.argv[0]} tt0139654\n")
        print("Download subtitles in English and Spanish for a movie with the given IMDb ID from YTS Subs (https://yts-subs.com).") 
        print("The subtitle files will be saved in the current directory with the format <imdb_id>-en.<en_sub_ext> and <imdb_id>-es.<es_sub_ext>.")
    else:
        imdb_id = sys.argv[1]
        english_url, spanish_url = get_download_page_urls(imdb_id)
        process_language(imdb_id, 'English', english_url)
        process_language(imdb_id, 'Spanish', spanish_url)
