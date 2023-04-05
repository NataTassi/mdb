import requests

def download_file(url: str, filename: str):
    """ Download file from the specified URL into the current directory with the given name. """

    with requests.get(url, stream=True) as response:
        response.raise_for_status()

        with open(filename, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
