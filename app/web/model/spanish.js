export const accentedVowelToVowel = {
    á : 'a',
    é : 'e',
    í : 'i',
    ó : 'o',
    ú : 'u',
    Á : 'A',
    É : 'E',
    Í : 'I',
    Ó : 'O',
    Ú : 'U'
};

export const vowelToAccentedVowel = {
    a : 'á',
    e : 'é',
    i : 'í',
    o : 'ó',
    u : 'ú',
    A : 'Á',
    E : 'É',
    I : 'Í',
    O : 'Ó',
    U : 'Ú'
};

export function removeSpanishAccents(text) {
    let newText = '';

    for (let c of text) {
        if (accentedVowelToVowel.hasOwnProperty(c)) {
            c = accentedVowelToVowel[c];
        }

        newText += c;
    }

    return newText;
}