class Language:
    """ Languages """
    ENGLISH = 'English'
    SPANISH = 'Spanish'


class LangCode:
    """ Language codes """
    ENGLISH = 'EN'
    SPANISH = 'ES'

    _dict = {
        Language.ENGLISH : ENGLISH,
        Language.SPANISH : SPANISH
    }

    @classmethod
    def lang(cls, language):
        """ Return the language code for the given language. English and Spanish are accepted. """
        return cls._dict[language]
