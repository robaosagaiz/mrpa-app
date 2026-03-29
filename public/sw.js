const CACHE_NAME = "mrpa-v1"

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(["/", "/logo-mrpa.png", "/manifest.json"]))
  )
})

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/")) return
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  )
})
