import { Hono } from './hono.js'
import { serveStatic } from './hono.serve-static.js'
import { logger } from './hono.logger.js'

let from

try {
  from = FROM // "Server" is set on Environment variables
} catch {
  from = 'Service Worker'
}

const app = new Hono()

// Middleware
app.use('/sw/*', logger())
app.use('/server/*', logger())
app.use('/:name{.+.js}', serveStatic({ root: './' }))

const script = `<script>
function register() {
  navigator.serviceWorker.register('/sw.js', { scope: '/sw/', type: 'module' }).then(function(registration) {
    console.log('Register Service Worker: Success');
  }, function(error) {
    console.log('Register Service Worker: Error');
  });
}
function start() {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Unregister Service Worker');
      registration.unregister();
    }
    register();
  })
}
start();
</script>`

const header = `<html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>pre { font-size: 2em; } body { padding: 2em; }</style>
  </head><body>
  <h1><a href="/">Service Worker Magic</a></h1>
  <ul><li><a href="/server/hello">From Server</a></li>
  <li><a href="/sw/hello">From Service Worker</a></li></ul>`

const footer = `
  <footer>Server and Browser(Service Worker) code are <a href="/sw.js">same</a>!</footer>
</body></html>`

// Top page
app.get('/', (c) => {
  const html = `${header}
  ${script}
  <pre>This is ${new URL(c.req.url).pathname}
Hello! from ${from}!
</pre><p><b>Registering Service Worker...</b></p>
  ${footer}
  `
  return c.html(html)
})

// Handler
const handler = (c) => {
  const html = `${header}
  <pre>This is ${new URL(c.req.url).pathname}
Hello! from ${from}!</pre>
  ${footer}
  `
  return c.html(html)
}

// Route
app.get('/server/hello', handler)
app.get('/sw/hello', handler)

// addEventListener('fetch'...
app.fire()
