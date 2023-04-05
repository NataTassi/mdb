import { mergeArrays, uniqueElements } from 'utils/objects';
import { removeSpanishAccents } from 'model/spanish'
import { errorObject, ErrorTitle } from 'utils/api';
import redisClient from 'model/redis/client';
import { isInt } from 'utils/number';


const SEPARATORS = new Set(',.<>{}[]"\':;!@#$%^&*()-+=~');
const ALL_DOCS = '*';

const IN_SPANISH = '_spanish';
const START = '_start';
const END = '_end';

const ERROR = 'error';
const QUERY = 'query';

const STATUS = 'status';
const RESPONSE = 'response'

export class ParamType {
    static TEXT = 'text';
    static TAG = 'tag';
    static RANGE_START = 'range_start';
    static RANGE_END = 'range_end';
}


function escapeSpaces(text) {
    let newText = '';

    for (let c of text) {
        if (c === ' ') newText += '\\';
        newText += c;
    }

    return newText;
}

function escapeSeparators(text) {
    let newText = '';

    for (let c of text) {
        if (SEPARATORS.has(c)) newText += '\\';
        newText += c;
    }

    return newText;
}

function textForRediSearch(text) {
    /**
     * Generates text ready for RediSearch. The current implementation removes
     * characters considered separators (used in tokenization) and Spanish accents,
     * and adds modifiers to perform fuzzy matching on words with at least 6 characters,
     * specifically the Levenshtein distance of the fuzzy match is set to 1 for words
     * between 6 and 11 characters, and it's set to 2 for words with at least 12 characters.
     * 
     * @param {string} text Text to process
     * @returns {string} The text ready for RediSearch
     */

    let words = escapeSeparators(removeSpanishAccents(text.trim())).split(' ');
    // const size = words.length;
    //for (let i = 0; i < size; i++) {
    //    const word = words[i];
    //    const len = word.length;
    //    if (len >= 12) words[i] = '%%' + word + '%%';
    //    else if (len >= 6) words[i] = '%' + word + '%';
    //}
    return `*${words.join('*')}*`;
}

function buildQuery(query, queryParamTypes) {
    if (Object.keys(query).length == 0) {
        return { [QUERY] : ALL_DOCS };
    } 

    let redisQuery = '';

    for (const [param, value] of Object.entries(query)) {
        if (!queryParamTypes.hasOwnProperty(param)) {
            return {
                [ERROR] : `'${param}' is not a valid parameter`
            };
        }

        const paramType = queryParamTypes[param];

        if (paramType === ParamType.TEXT) {
            const val = textForRediSearch(value);
            redisQuery += `((@${param}:(${val}))|(@${param + IN_SPANISH}:(${val}))) `;
        }
        else if (paramType === ParamType.TAG) {
            const val = escapeSpaces(escapeSeparators(value));

            if (param === 'genre') {
                redisQuery += `((@${param}:{${val}})|(@${param + IN_SPANISH}:{${val}})) `;
            }
            else {
                redisQuery += `(@${param}:{${val}}) `;
            }
        }
        else if (paramType === ParamType.RANGE_START) {
            const rangeStartKey = param;
            const rangeStartVal = value;

            if (!isInt(rangeStartVal)) {
                return {
                    [ERROR] : `The value '${rangeStartVal}' in the parameter ${rangeStartKey} must be a number`
                };
            }

            const paramName = rangeStartKey.replace(START, '');
            const rangeEndKey = paramName + END;

            if (query.hasOwnProperty(rangeEndKey)) {
                const rangeEndVal = query[rangeEndKey];

                if (!isInt(rangeEndVal)) {
                    return {
                        [ERROR] : `The value '${rangeEndVal}' in the parameter ${rangeEndKey} must be a number`
                    };
                }

                if (parseInt(rangeStartVal) > parseInt(rangeEndVal)) {
                    return {
                        [ERROR] : `${rangeStartKey} must be less than or equal to ${rangeEndKey}`
                    };
                }

                redisQuery += `(@${paramName}:[${rangeStartVal} ${rangeEndVal}]) `;
            }
            else {
                redisQuery += `(@${paramName}:[${rangeStartVal} +inf]) `;
            }
        }
        else if (paramType === ParamType.RANGE_END) {
            const rangeEndKey = param;
            const rangeEndVal = value;
            const paramName = rangeEndKey.replace(END, '');
            const rangeStartKey = paramName + START;

            if (!query.hasOwnProperty(rangeStartKey)) {
                if (!isInt(rangeEndVal)) {
                    return {
                        [ERROR] : `The value '${rangeEndVal}' in the parameter ${rangeEndKey} must be a number`
                    };
                }

                redisQuery += `(@${paramName}:[-inf ${rangeEndVal}]) `;
            }
        }
    }

    console.debug('Redis query: ' + redisQuery + '\n');
    
    return { [QUERY] : redisQuery };
}

async function processQuery(index, redisQuery) {
    const client = await redisClient();
    return await client.ft.search(index, redisQuery, {LIMIT: {from: 0, size: 10000}}); // The default is 0 10
}

export async function search(index, query, queryParamTypes, callback) {
    const redisQueryObj = buildQuery(query, queryParamTypes);
    
    if (redisQueryObj.hasOwnProperty(ERROR)) {
        return {
            [STATUS] : 400,
            [RESPONSE] : errorObject(ErrorTitle.BAD_REQUEST, redisQueryObj[ERROR])
        };
    }
    else {
        const redisResults = await processQuery(index, redisQueryObj[QUERY]);
        const results = callback == null ? redisResults : callback(redisResults);

        return {
            [STATUS] : 200,
            [RESPONSE] : results
        };
    }
}

export async function aggregate(index, param) {
    const client = await redisClient();
    const cmd = `FT.AGGREGATE ${index} * LOAD 3 $.${param} AS ${param}`;
    let response = await client.sendCommand(cmd.split(' '));
    response = response.slice(1);

    let elements = [];

    for (const item of response) if (item.length) {
        const value = item[1];

        if (value[0] === '[' && value.slice(-1) === ']') {
            const arr = value.substring(2, value.length - 2).split('\",\"');
            elements.push(...arr);
        }
        else {
            elements.push(value);
        }
    }

    return uniqueElements(elements).sort();
}