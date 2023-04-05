export function mergeArrays(arrOfArr) {
    return [].concat(...arrOfArr);
}

export function uniqueElements(arr) {
    return [...new Set(arr)];
}