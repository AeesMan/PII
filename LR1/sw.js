const CACHE_NAME = 'students-cms-v1';
const ASSETS_TO_CACHE = [
    './students.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './avatar.jpg',
    './tasks.html',
    './dashboard.html',
];

// Встановлення Service Worker та кешування файлів
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Кешування файлів PWA...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Активація та очищення старих кешів
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Перехоплення запитів: якщо немає інтернету, віддаємо файл з кешу
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            // Фолбек, якщо запит не вдався і його немає в кеші
            if (event.request.mode === 'navigate') {
                return caches.match('./students.html');
            }
        })
    );
});