export function encode(url) {
    try {
        return btoa(encodeURI(url));
    } catch(error) {
        return null;
    }
}

export function decode(url) {
    try {
        return decodeURI(atob(url));
    } catch(error) {
        return null;
    }
}