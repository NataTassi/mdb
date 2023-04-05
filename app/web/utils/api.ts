export enum ErrorTitle {
    BAD_REQUEST = 'Bad Request',
    NOT_FOUND = 'Not Found',
}

export const statusByTitle = {
    [ErrorTitle.BAD_REQUEST] : 400, 
    [ErrorTitle.NOT_FOUND] : 404 
};

export function errorObject(title: ErrorTitle, detail: string) {
    return {
        status : statusByTitle[title],
        title : title,
        detail : detail
    };
}

export function extraParams() {
    return errorObject(ErrorTitle.BAD_REQUEST, 'Unrecognized extra parameters');
}

export const jsonFetcher = (...args) => fetch(...args).then((res) => res.json());