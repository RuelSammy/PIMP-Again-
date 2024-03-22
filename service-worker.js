// service-worker.js

// This event listener will be triggered when the service worker is installed
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
  });
  
  // This event listener will be triggered when the service worker is activated
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
  });
  
  // This event listener will be triggered when the service worker intercepts a fetch request
  self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted:', event.request.url);
    // You can add custom fetch handling logic here
  });
  