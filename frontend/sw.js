/*
 * NOTE: Add promise and fetch polyfills to enable serviceworker work on
 * unsupported browsers. Checkout latest versions of polyfills
 */

/*
 * set  constant
 *
 */
var STATIC_CACHE_NAME = "static_v1";
var DYNAMIC_CACHE_NAME = "dynamic_v1";
var CACHE_MAXIMUM_ITEM = 200;

/*
 *setup files to be cache as array
 *
 */
var STATIC_FILES = [
  "/",
  "/index.html",
  // "/bookaid/",
  // "/clients/",
  // "/contact/",
  // "/health/",
  // "/hr/",
  // "/platforms/",
  "/offline/"
  // "/css/app.css",
  // "/css/main.css",
  // "/css/slider.css",
  // "/js/app.js",
  // "/js/animate.js",
  // "/js/form.js",
  // "/js/script.js",
  // "/js/slider.js",
  // "https://fonts.googleapis.com/css?family=Montserrat"
];

/*
 *to check for storage size
 *
 */
if ("storage" in navigator && "estimate" in navigator.storage) {
  navigator.storage.estimate().then(function(est) {
    console.log(est.quota);
    console.log(est.usage);
  });
}

/*
 *install service worker and cache static assests listed above
 *
 */
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_FILES);
    })
  );
});

/*
 *activate service worker  and remove old cache history
 *
 */
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

/*
 *loop to get file in cache if present
 *
 */
function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return string;
    }
  }
  return false;
}

/*
 *fetch assets while browser is offline and store get request in cache
 *
 */
self.addEventListener("fetch", function(event) {
  if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(DYNAMIC_CACHE_NAME).then(function(cache) {
                trimCache(DYNAMIC_CACHE_NAME, CACHE_MAXIMUM_ITEM);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function(err) {
              return caches.open(STATIC_CACHE_NAME).then(function(cache) {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline/");
                }
              });
            });
        }
      })
    );
  }
});

/*
 * handle static caching on request like when use triggers an action.
 *This method should resides in the browser/client side js file
 *
 */
function handleCacheOnUserEvent(e) {
  event.preventDefault(); // prevent default triggers for form button if attached
  if ("caches" in window) {
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME).then(function(cache) {
        return cache.addAll(STATIC_FILES);
      })
    );
  }
}

/*
 * delete a service worker by using this method. The method can also be used on the browser side
 * javascript to delete a sw after the user triggers an event
 */
function deleteServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (var i = 0; i < registrations.length; i++) {
        registrations[i].unregister();
      }
    });
  }
}

/*
 *trim cache to avoid app crash
 *
 */
function trimCache(cacheName, maxItem) {
  caches.open(cacheName).then(function(cache) {
    return cache.keys().then(function(keys) {
      if (keys.length > maxItem) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItem));
      }
    });
  });
}
