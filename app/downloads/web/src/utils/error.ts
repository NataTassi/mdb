export enum ErrorTitle {
    BAD_REQUEST = 'Bad Request',
    NOT_FOUND = 'Not Found',
    METHOD_NOT_ALLOWED = 'Method Not Allowed'
}

export const statusByTitle = {
    [ErrorTitle.BAD_REQUEST] : 400, 
    [ErrorTitle.NOT_FOUND] : 404,
    [ErrorTitle.METHOD_NOT_ALLOWED] : 405
};

export function error(title: ErrorTitle, detail: string) {
    return title + ' - ' + detail;
}

export function extraParams() {
    return error(ErrorTitle.BAD_REQUEST, 'Unrecognized extra parameters');
}

export function invalidImdbID() {
    return error(ErrorTitle.BAD_REQUEST, 'Invalid IMDb ID');
}