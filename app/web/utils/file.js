const axios = require('axios').default;
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/'
});

export function urlExistsBrowser(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send();
    return xhr.status == '200';
}

export async function urlExists(url) {
    try {
        const response = await axiosInstance.head(url);
        return response.status == 200;
    } catch(error) {
        console.info(`"${url}" does not exist`);
    }
}