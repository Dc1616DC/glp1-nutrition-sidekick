/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-35db0ca0'], (function (workbox) { 'use strict';

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "/_next/app-build-manifest.json",
    "revision": "648ea547f6344e89ce9da42569797c9a"
  }, {
    "url": "/_next/build-manifest.json",
    "revision": "35f1562458fde1518b2c9808eefc3fc1"
  }, {
    "url": "/_next/react-loadable-manifest.json",
    "revision": "99914b932bd37a50b983c5e7c90ae93b"
  }, {
    "url": "/_next/server/app/_not-found/page_client-reference-manifest.js",
    "revision": "23d2a395cd28d5dc61dd6f21bc16266e"
  }, {
    "url": "/_next/server/app/page_client-reference-manifest.js",
    "revision": "e7ba39d48e8fd50c45803121274ea5c5"
  }, {
    "url": "/_next/server/middleware-build-manifest.js",
    "revision": "4dc6647f58dedfc99e331e8429e885a0"
  }, {
    "url": "/_next/server/middleware-react-loadable-manifest.js",
    "revision": "537157e425123611736ddcf544160221"
  }, {
    "url": "/_next/server/next-font-manifest.js",
    "revision": "0c8bcb30162e193f73cb29446f2eed15"
  }, {
    "url": "/_next/server/next-font-manifest.json",
    "revision": "8b7aad6c74403f6737b9ffd059987a8e"
  }, {
    "url": "/_next/static/chunks/app-pages-internals.js",
    "revision": "f30eda6a7d214749d65ed48d75c2ed96"
  }, {
    "url": "/_next/static/chunks/app/_not-found/page.js",
    "revision": "80664a46595720fd6b36f1dc06c3ea69"
  }, {
    "url": "/_next/static/chunks/app/layout.js",
    "revision": "6e1703f3661ec104813e7dadb9c1a535"
  }, {
    "url": "/_next/static/chunks/app/page.js",
    "revision": "2e70e798cdc52fa11a956256cfe48ca4"
  }, {
    "url": "/_next/static/chunks/polyfills.js",
    "revision": "846118c33b2c0e922d7b3a7676f81f6f"
  }, {
    "url": "/_next/static/chunks/webpack.js",
    "revision": "76c695812c714f4ce3f684b4b25bf490"
  }, {
    "url": "/_next/static/css/app/layout.css",
    "revision": "388530d1e4c38984869199a2931cbbd8"
  }, {
    "url": "/_next/static/development/_buildManifest.js",
    "revision": "97f1258b3dd30d37ba33a4c4ed741eed"
  }, {
    "url": "/_next/static/development/_ssgManifest.js",
    "revision": "abee47769bf307639ace4945f9cfd4ff"
  }, {
    "url": "/_next/static/media/569ce4b8f30dc480-s.p.woff2",
    "revision": "ef6cefb32024deac234e82f932a95cbd"
  }, {
    "url": "/_next/static/media/747892c23ea88013-s.woff2",
    "revision": "a0761690ccf4441ace5cec893b82d4ab"
  }, {
    "url": "/_next/static/media/8d697b304b401681-s.woff2",
    "revision": "cc728f6c0adb04da0dfcb0fc436a8ae5"
  }, {
    "url": "/_next/static/media/93f479601ee12b01-s.p.woff2",
    "revision": "da83d5f06d825c5ae65b7cca706cb312"
  }, {
    "url": "/_next/static/media/9610d9e46709d722-s.woff2",
    "revision": "7b7c0ef93df188a852344fc272fc096b"
  }, {
    "url": "/_next/static/media/ba015fad6dcf6784-s.woff2",
    "revision": "8ea4f719af3312a055caf09f34c89a77"
  }, {
    "url": "/_next/static/webpack/10b4ec3b30f01ae4.webpack.hot-update.json",
    "revision": "development"
  }, {
    "url": "/_next/static/webpack/app/layout.10b4ec3b30f01ae4.hot-update.js",
    "revision": "development"
  }, {
    "url": "/_next/static/webpack/webpack.10b4ec3b30f01ae4.hot-update.js",
    "revision": "development"
  }], {
    "ignoreURLParametersMatching": [/ts/]
  });
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute("/", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({
        request,
        response,
        event,
        state
      }) => {
        if (response && response.type === 'opaqueredirect') {
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        return response;
      }
    }]
  }), 'GET');
  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: []
  }), 'GET');

}));
