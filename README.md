# Service Worker Magic

- Server (Cloudflare Workers) code is [`sw.js`](./src/sw.js).
- Browser ( Service Worker ) code is [`sw.js`](./src/sw.js).
- Cloudflare Workers [`sw.js`](./src/sw.js) serves [`sw.js`](./src/sw.js).
- Service Worker [`sw.js`](./src/sw.js) will be registered on `/`. The scope is `/sw/*`.
- `/server/hello` => from the server.
- `/sw/hello` => from the browser not from a server. Request is intercepted by Service Worker.

It's magic.

## Demo

- <https://service-worker-magic.yusukebe.workers.dev>

## Screencast

![SS](https://user-images.githubusercontent.com/10682/153455595-77fea6e5-93d7-4698-8d75-85896edd995b.gif)

## Walkthrough

### Server

Run Cloudflare Workers on your terminal:

```sh
$ wrangler dev sw.js
```

`sw.js` is served by `sw.js`.

### Browser

Access `/`. Your browser will load `sw.js`:

```js
navigator.serviceWorker.register('/sw.js', { scope: '/sw/', type: 'module' })
```

Service Worker is registered.

### Then...

- `/server/hello` => content is returned from the server.
- `/sw/hello` => content is returned from the browser. Not from the server.

### Attention

If Service Worker does not work, clear the cache on your browser.

## Code

Just [`sw.js`](./src/sw.js).

### Short version

It does not work well.

```js
import { Hono } from './hono.js'
import { serveStatic } from './hono.serve-static.js'
import { logger } from './hono.logger.js'

let from = 'Service Worker'

try {
  from = FROM // "Server" is set on Cloudflare Workers environment variables
}

const app = new Hono()

// Middleware
app.use('/sw/*', logger())
app.use('/server/*', logger())
app.use('/:name{.+.js}', serveStatic({ root: './' }))


// Top page
app.get('/', (c) => {
  const html = `<html><body>
  <script>
    navigator.serviceWorker.register('/sw.js', { scope: '/sw/', type: 'module' })
  </script>
  </body></html>`
  return c.html(html)
})

// Handler
const handler = (c) => {
  const text = `Hello! from ${from}!`
  return c.text(text)
}

// Route
app.get('/server/hello', handler)
app.get('/sw/hello', handler)

// addEventListener('fetch'...
app.fire()
```

## Related projects

`sw.js` is using Hono as Service Worker framework.

- Hono\[炎\] <https://github.com/yusukebe/hono>

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

MIT
