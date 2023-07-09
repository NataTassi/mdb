import { isInt } from './number.js';

export function validImdbID(id) {
    return typeof id === 'string' && 
        (id.length == 9 || id.length == 10) && 
        id.substring(0, 2) == 'tt' &&
        isInt(id.substring(2));
}