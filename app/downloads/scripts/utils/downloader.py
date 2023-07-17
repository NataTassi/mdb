import os
import requests


def download_file(url, filename='', directory='.'):
    """ 
    Download file from the specified URL and save it with the given name into the given directory
    or the current directory if not specified. 
    
    Returns:
        True if the download was successful, False otherwise
    """

    response = requests.get(url)

    if response.status_code != 200:
        return False

    if not os.path.exists(directory):
        os.makedirs(directory)

    if not filename:
        filename = url.split('/')[-1]

    path = os.path.join(directory, filename)

    try:
        with open(path, 'wb') as fd:
            for chunk in response.iter_content(chunk_size=8192):
                fd.write(chunk) 
    except EnvironmentError:
        return False

    return True
