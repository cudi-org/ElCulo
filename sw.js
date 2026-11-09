const CACHE_NAME = 'reyoculo-v3';

const CARD_ASSETS = [
    './assets/cartas/reverso.png',

    './assets/cartas/bastos_01_as.png',
    './assets/cartas/bastos_02.png',
    './assets/cartas/bastos_03.png',
    './assets/cartas/bastos_04.png',
    './assets/cartas/bastos_05.png',
    './assets/cartas/bastos_06.png',
    './assets/cartas/bastos_07.png',
    './assets/cartas/bastos_10_sota.png',
    './assets/cartas/bastos_11_caballo.png',
    './assets/cartas/bastos_12_rey.png',

    './assets/cartas/copas_01_as.png',
    './assets/cartas/copas_02.png',
    './assets/cartas/copas_03.png',
    './assets/cartas/copas_04.png',
    './assets/cartas/copas_05.png',
    './assets/cartas/copas_06.png',
    './assets/cartas/copas_07.png',
    './assets/cartas/copas_10_sota.png',
    './assets/cartas/copas_11_caballo.png',
    './assets/cartas/copas_12_rey.png',

    './assets/cartas/espadas_01_as.png',
    './assets/cartas/espadas_02.png',
    './assets/cartas/espadas_03.png',
    './assets/cartas/espadas_04.png',
    './assets/cartas/espadas_05.png',
    './assets/cartas/espadas_06.png',
    './assets/cartas/espadas_07.png',
    './assets/cartas/espadas_10_sota.png',
    './assets/cartas/espadas_11_caballo.png',
    './assets/cartas/espadas_12_rey.png',

    './assets/cartas/oros_01_as.png',
    './assets/cartas/oros_02.png',
    './assets/cartas/oros_03.png',
    './assets/cartas/oros_04.png',
    './assets/cartas/oros_05.png',
    './assets/cartas/oros_06.png',
    './assets/cartas/oros_07.png',
    './assets/cartas/oros_10_sota.png',
    './assets/cartas/oros_11_caballo.png',
    './assets/cartas/oros_12_rey.png'
];

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './js/cards.js',
    './js/game-engine.js',
    './js/p2p-network.js',
    './js/audio-synth.js',
    './js/app.js',
    './header-logo.jpg',
    ...CARD_ASSETS
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Purging old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});
