export function urlExists(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send();
    return xhr.status == '200';
}

export function buildURL(url, params) {
	url = new URL(url);
	params = new URLSearchParams(params);
	url.search = params.toString();
	return url;
}

// const axios = require('axios').default;
// const axiosInstance = axios.create({
    // baseURL: 'http://localhost:3000/'
// });

// export async function urlExists(url) {
    // try {
        // const response = await axiosInstance.head(url);
        // return response.status == 200;
    // } catch(error) {
        // console.info(`"${url}" does not exist`);
    // }
// }