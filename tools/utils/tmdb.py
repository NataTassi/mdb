import os
import sys


def check_api_key():
    """
    Check if the TMDb API key is loaded as an env var.
    If it isn't, an error message will notify you and the program will exit.
    """

    tmdb_api_key = os.environ.get("TMDB_API_KEY")

    if not tmdb_api_key:
        print("(-) TMDB_API_KEY env var not set", file=sys.stderr)
        print(file=sys.stderr)
        print("In Linux:    export TMDB_API_KEY=<movies_dir>", file=sys.stderr)
        print("In Windows:  set TMDB_API_KEY=<movies_dir>", file=sys.stderr)
        sys.exit()