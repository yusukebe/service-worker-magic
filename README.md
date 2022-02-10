# Service Worker Magic

Server and Browser(Service Worker) code are same.

- Server (Cloudflare Workers) code is [`sw.js`](./src/sw.js).
- Browser ( Service Worker ) code is [`sw.js`](./src/sw.js).

It's magic.

## Demo

- <https://service-worker-magic.yusukebe.workers.dev>

## Screencast

![SS](https://user-images.githubusercontent.com/10682/153455595-77fea6e5-93d7-4698-8d75-85896edd995b.gif)

## Walkthrough

### Server

Run Cloudflare Workers on your terminal:

```sh
$ wrangler dev src/sw.js
```

### Browser

Access `/` on your browser, Service Worker is registered:

```js
navigator.serviceWorker.register('/sw.js', { scope: '/sw/', type: 'module' })
```

### Then...

- `/server/hello` => served from the server.
- `/sw/hello` => served by the browser.

## Code

Just [`sw.js`](./src/sw.js).

## Related projects

`sw.js` is using Hono as Service Worker framework.

- Hono\[炎\] <https://github.com/yusukebe/hono>

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

MIT
