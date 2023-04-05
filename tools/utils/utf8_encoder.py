ENCODINGS = {
    'ascii' : 'ASCII',
    'utf-8-sig' : 'UTF-8',
    'latin1': 'Latin1'
}

def decode(filepath) -> str:
    """
    Return the decoded text file pointed by filepath as UTF-8 or None if it can't be decoded.
    If the file is encoded as UTF-8 with BOM, the BOM will be removed.
    """

    content = None

    for encoding, encoding_name in ENCODINGS.items():
        try:
            with open(filepath, 'r', encoding=encoding) as file:
                content = file.read()
                print(f"(!) {encoding_name} encoding detected")
                break
        except UnicodeDecodeError:
            pass

    if content is None:
        print("(-) encoding couldn't be detected")

    return content


def encode(filepath):
    """ Re-encode the text file pointed by filepath as UTF-8. """

    content = decode(filepath)

    if content is not None:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
            print(f"(+) {filepath}: Conversion to UTF-8 succeeded")
    else:
        print(f"(-) {filepath}: Conversion to UTF-8 failed")
