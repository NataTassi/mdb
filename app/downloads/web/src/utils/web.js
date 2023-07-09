const fs = require('fs');
const path = require('path');
const https = require('https');

export function buildURL(url, params) {
	url = new URL(url);
	params = new URLSearchParams(params);
	url.search = params.toString();
	return url.href;
}

export function createDir(dir) {
	if (!fs.existsSync(dir)) {
	    fs.mkdirSync(dir, { recursive: true });
	}
}

/**
 * Download a file from the given `url` into the `targetFile`.
 *
 * @param {String} url
 * @param {String} targetFile
 *
 * @returns {Promise<void>}
 */
export async function downloadFile(url, targetFile) {  
	const fs = require('fs');

  	return await new Promise((resolve, reject) => {
  	  	https.get(url, response => {
  	  	  	const code = response.statusCode;

  	  	  	if (code >= 400) {
  	  	  	  	return reject(new Error(response.statusMessage));
  	  	  	}

  	  	  	// handle redirects
  	  	  	if (code > 300 && code < 400 && !!response.headers.location) {
  	  	  	  	return resolve(
  	  	  	  	  	downloadFile(response.headers.location, targetFile)
  	  	  	  	);
  	  	  	}

			createDir(path.dirname(targetFile));

  	  	  	// save the file to disk
  	  	  	const fileWriter = fs
  	  	  		.createWriteStream(targetFile)
  	  	  		.on('finish', () => {
  	  	  		  	resolve({})
  	  	  		});

  	  	  	response.pipe(fileWriter);
  	  	}).on('error', error => reject(error));
  	})
}