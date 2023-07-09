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

export function errorObject(title: ErrorTitle, detail: string) {
    return {
        status : statusByTitle[title],
        title : title,
        detail : detail
    };
}