import { createClient } from 'redis';

var client = null;

async function init() {
    // By default prefix searches are limited to 2 letters or more
    await client.ft.configSet('MINPREFIX', '1');
}

export default async function getClient() {
    if (client === null) {
        console.debug('Creating Redis client...');
        client = createClient({url: 'redis://db'}); // db is the hostname of the dockerized Redis server 
        client.on('error', (err) => console.error('Redis client error', err));
        await client.connect();
        await init();
    }

    return client;
}