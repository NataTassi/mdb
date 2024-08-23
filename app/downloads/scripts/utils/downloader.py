#!/usr/bin/env python3
import os
import requests
from urllib.parse import unquote


def get_filename_from_cd(cd):
    """
    Get the filename from content-disposition.
    """
    if not cd:
        return None
    filename = None
    if 'filename*=' in cd:
        filename = unquote(cd.split("filename*=")[-1].split("''")[-1])
    elif 'filename=' in cd:
        filename = cd.split('filename=')[-1].strip('"')
    return filename


def download_file(url, filename=None, directory='.'):
    """
    Downloads a file from a given URL in chunks and writes it to the specified destination path.
    Returns True if the download was successful, otherwise False.

    :param url: URL of the file to be downloaded.
    :param filename: Name of the file to be saved. If None, use the filename from the Content-Disposition header.
    :param directory: Directory where the file will be saved. Defaults to the current directory.
    :return: True if download was successful, otherwise False.
    """
    try:
        with requests.get(url, stream=True) as response:
            response.raise_for_status()
            
            # Use the filename from the Content-Disposition header if not provided
            if filename is None:
                cd = response.headers.get('content-disposition')
                filename = get_filename_from_cd(cd)

                if filename is None:
                    filename = url.split('/')[-1]  # Fallback to the last part of the URL
            
            dest_path = os.path.join(directory, filename)
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            try:
                with open(dest_path, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=1024):
                        if chunk:
                            file.write(chunk)
                            downloaded_size += len(chunk)
                            print(f"Downloaded {downloaded_size:,} of {total_size:,} bytes", end='\r')

                print(f"\nDownload completed. File saved at '{os.path.abspath(dest_path)}'.")
                return True

            except IOError as e:
                print(f"An error occurred while writing the file: {e}")
                return False

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while downloading the file: {e}")
        return False


def test():
    url = "http://ipv4.download.thinkbroadband.com/20MB.zip"
    download_file(url)


if __name__ == "__main__":
    test()
