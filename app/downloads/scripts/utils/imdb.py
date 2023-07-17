def valid_imdb_id(id):
    return (len(id) == 9 or len(id) == 10) and \
        id[:2] == 'tt' and \
        id[2:].isdigit()