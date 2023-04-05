import os
import sys
import zipfile
import datetime
import requests
from utils import downloader, utf8_encoder
from utils.constants import LangCode, Language

BASE_URL = 'https://yifysubtitles.org/'
MOVIE_IMDB_URL = BASE_URL + 'movie-imdb/'
DOWNLOAD_URL = BASE_URL + 'subtitle/'
SUBTITLES_LANG = 'class="sub-lang">'
SUBTITLES_URL = '<a href="/subtitles/'

MILLION = 10 ** 6
FPS = 23.976024
FRAME_MICROSECONDS = MILLION / FPS


def download_subtitles_archive(imdb_id: str, filename: str, language: str):
    """
    Download subtitles zip archive for the movie with the given IMDb ID
    into the current directory with the given filename.
    """

    try:
        response = requests.get(MOVIE_IMDB_URL + imdb_id)
        response.raise_for_status()
        content = response.text

        start = 0
        subtitles_found = False

        while not subtitles_found and start != -1:
            start = content.find(SUBTITLES_LANG, start)

            if start != -1:
                start += len(SUBTITLES_LANG)

                if content[start : start + len(language)] == language:
                    start = content.find(SUBTITLES_URL, start)

                    if start != -1:
                        start += len(SUBTITLES_URL)
                        url = DOWNLOAD_URL + content[start : content.find('"', start)] + '.zip'
                        downloader.download_file(url, filename)

                        print(f"(+) {language} subtitles for {imdb_id}: "
                            "subtitles downloaded", flush=True)

                        return True

                    print(f"(-) {language} subtitles for {imdb_id}: URL not found, "
                        "YIFY changed its website", flush=True, file=sys.stderr)

        print(f"(-) {language} subtitles for {imdb_id}: language not available",
            flush=True, file=sys.stderr)

    except requests.exceptions.ConnectionError:
        print(f"(-) {language} subtitles for {imdb_id}: Connection error",
            flush=True, file=sys.stderr)

    except requests.exceptions.Timeout:
        print(f"(-) {language} subtitles for {imdb_id}: Timeout",
            flush=True, file=sys.stderr)

    except requests.exceptions.RequestException as err:
        print(f"(-) {language} subtitles for {imdb_id}: {err}", flush=True, file=sys.stderr)

    return False


def download_subtitles(imdb_id: str, output_dir: str, filename: str, language: str):
    """
    Download subtitles for the movie with the given IMDb ID, output dir, filename and language.
    """

    subtitles_found = False

    output_dir = os.path.normpath(output_dir)
    output_path = os.path.join(output_dir, filename)
    cwd = os.getcwd()
    tmp_filename = f"{imdb_id}_{LangCode.lang(language)}"
    tmp_dir_path = os.path.join(cwd, tmp_filename + '_tmp')
    os.mkdir(tmp_dir_path)
    os.chdir(tmp_dir_path)
    subtitles_archive = tmp_filename + '.zip'

    download_successful = download_subtitles_archive(imdb_id, subtitles_archive, language)

    if download_successful:
        with zipfile.ZipFile(subtitles_archive, 'r') as zip_file:
            zip_file.extractall()

            for file in os.listdir(tmp_dir_path):
                filepath = os.path.join(tmp_dir_path, file)

                if file.endswith('.srt'):
                    subtitles_found = True
                    output_path += '.srt'

                elif file.endswith('.sub'):
                    subtitles_found = True
                    output_path += '.sub'

                if subtitles_found:
                    os.replace(filepath, output_path)
                    break

        for file in os.listdir(tmp_dir_path):
            filepath = os.path.join(tmp_dir_path, file)
            os.remove(filepath)

    os.rmdir(tmp_dir_path)
    os.chdir(cwd)

    if subtitles_found:
        print(f"(+) {language} subtitles for {imdb_id}: "
            f"subtitles extracted as '{os.path.basename(output_path)}'", flush=True)
    elif download_successful:
        print(f"(-) {language} subtitles for {imdb_id}: unrecognized subtitles format",
            flush=True, file=sys.stderr)

    return output_path if subtitles_found else None


def remove_file_extension(filepath: str):
    """ Return filepath without the file extension. """
    return filepath.rsplit('.', 1)[0]


def srt_to_vtt(filepath: str):
    """
    Convert a subtitles file from SRT to VTT. A new file with the same name and
    '.vtt' extension will be created in the same directory as the given file.
    """

    filename = os.path.basename(filepath)

    try:
        content = utf8_encoder.decode(filepath)

        if content is None:
            return

        output_file = remove_file_extension(filepath) + '.vtt'

        with open(output_file, 'w', encoding='utf-8') as vtt:
            vtt.write('WEBVTT \n\n')

            for line in content.split('\n')[:-1]:
                if not line.isdigit():
                    if line.find(' --> ') != -1:
                        line = line.replace(',', '.')

                    vtt.write(line + '\n')

        print(f"(+) {filename}: conversion to VTT succeeded", flush=True)

    except FileNotFoundError:
        print(f"(-) {filename}: conversion to VTT failed, file not found",
            flush=True, file=sys.stderr)


def microseconds_to_vtt_time(time_in_microsecs: int) -> str:
    """ Return time formatted as 00:00:00.000 as used in VTT subtitles."""

    microsecs = time_in_microsecs % MILLION
    time_in_seconds = time_in_microsecs // MILLION
    secs = time_in_seconds % 60
    time_in_minutes = time_in_seconds // 60
    mins = time_in_minutes % 60
    hours = time_in_minutes // 60

    time = datetime.time(hours, mins, secs, microsecs)
    return time.strftime('%H:%M:%S.%f')[:-3]


def sub_to_vtt(filepath: str):
    """
    Convert a subtitles file from SUB to VTT. The original encoding will be detected
    automatically and changed to UTF-8. A new file with the same name and
    '.vtt' extension will be created in the same directory as the given file.
    """

    filename = os.path.basename(filepath)

    try:
        content = utf8_encoder.decode(filepath)

        if content is None:
            return

        output_file = remove_file_extension(filepath) + '.vtt'

        with open(output_file, 'w', encoding='utf-8') as sub:
            sub.write('WEBVTT \n\n')

            for line in content.split('\n')[:-1]:
                if line.startswith('{'):
                    first_closing_bracket = line.find('}')
                    second_closing_bracket = line.find('}', first_closing_bracket + 1)
                    start_time = int(line[1 : first_closing_bracket])
                    start_time = round(FRAME_MICROSECONDS * start_time)
                    end_time = int(line[first_closing_bracket + 2 : second_closing_bracket])
                    end_time = round(FRAME_MICROSECONDS * end_time)

                    formatted_start_time = microseconds_to_vtt_time(start_time)
                    formatted_end_time = microseconds_to_vtt_time(end_time)
                    sub.write(f"{formatted_start_time} --> {formatted_end_time}\n")

                    text_start = second_closing_bracket + 1

                    while text_start < len(line):
                        text_end = line.find('|', text_start)

                        if text_end == -1:
                            text_end = len(line)

                        sub.write(line[text_start : text_end] + '\n')
                        text_start = text_end + 1

                    sub.write('\n')

        print(f"(+) {filename}: conversion to VTT succeeded", flush=True)

    except FileNotFoundError:
        print(f"(-) {filename}: conversion to VTT failed, file not found",
            flush=True, file=sys.stderr)


def get_subtitles_in_english_and_spanish(imdb_id: str, output_dir: str, filename: str):
    """
    Download subtitles from YIFY Subtitles in English and Spanish, extract them
    from their archives, and convert them to VTT with UTF-8 encoding.
    SRT and SUB subtitles supported.
    """

    for language in (Language.ENGLISH, Language.SPANISH):
        new_filename = filename + ' ' + LangCode.lang(language)
        downloaded_subtitles = download_subtitles(imdb_id, output_dir, new_filename, language)

        if downloaded_subtitles is not None:
            if downloaded_subtitles.endswith('.srt'):
                srt_to_vtt(downloaded_subtitles)

            elif downloaded_subtitles.endswith('.sub'):
                sub_to_vtt(downloaded_subtitles)

            os.remove(downloaded_subtitles)


if __name__ == '__main__':
	if len(sys.argv) != 3:
		print(f"Usage: {sys.argv[0]} <imdb_id> <filename>")
	else:
		get_subtitles_in_english_and_spanish(sys.argv[1], os.getcwd(), sys.argv[2])

