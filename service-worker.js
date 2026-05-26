const CACHE_NAME = "bae-mobile-v2";

const arquivos = [

    "./",
    "./index.html",
    "./novo.html",
    "./registros.html",

    "./style.css",
    "./script.js",
    "./database.js",
    "./sync.js",

    "./icons/offline.png",
    "./icons/online.png",

    "./icons/dashboard.png",
    "./icons/registros.png",
    "./icons/novo.png",

    "./icons/pendentes.png",
    "./icons/enviados.png",
    "./icons/falhas.png",
    "./icons/total.png",

    "./icons/ultima_sincronizacao.png",

    "./icons/favicon.png"

];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(arquivos);

            })

    );

});

self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    if (url.pathname.endsWith(".html")) {

        event.respondWith(

            caches.match(url.pathname)

                .then(response => {

                    return response || fetch(event.request);

                })

        );

        return;

    }

    event.respondWith(

        caches.match(event.request)

            .then(response => {

                return response || fetch(event.request);

            })

    );

});
