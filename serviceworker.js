const CACHENAME = 'chris-petta-portfolio';

// On install, cache static resources that are always needed.
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHENAME).then((cache) => {
            cache.addAll([
                './index.html',
                './css/main.css',
                './js/custom.js',
                './fonts/Roboto/Roboto-Light.ttf',
                './fonts/Roboto/Roboto-Medium.ttf',
                './fonts/Oxygen/Oxygen-Bold.ttf',
                './images/portlogo.svg',
		    ])
        })
    )
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
        assetsFromCache(event.request)
        .then((response) => {
            return cacheFallbackToNetwork(response, event.request);
        })
    );
});
/**
 * When a fetch request is made, check the cache for the fetched resource.
 * @param {Request} request fetch event request return object
 */
async function assetsFromCache(request) {
	let cache = await caches.open(CACHENAME);
	return cache.match(request.url);
};
/**
 * return the cache response, or if it's not available make a network request and add to cache.
 * @param {Request} request fetch event request return object
 */
async function cacheFallbackToNetwork(response, request) {
    if(response) {
        return response;
    }
    return fetchAndCache(request)
}
async function fetchAndCache(request) {
	let cache = await caches.open(CACHENAME);
	let response = await fetch(request);
	await cache.put(request, response.clone());
	return response;
}