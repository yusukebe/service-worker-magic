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
      console.log('Unregister Service Worker')
     registration.unregister()
    }
    register()
  })
}
start();
</script>`

const header = `<html><body>
  <h1><a href="/">Service Worker Magic</a></h1>`

const footer = `
  <ul><li><a href="/server/hello">From Server</a></li>
  <li><a href="/sw/hello">From Service Worker</a></li></ul>
  <hr /><footer>Server and Browser(Service Worker) code are <a href="/sw.js">same</a>!</footer>
</body>
</html>`

// Top page
app.get('/', (c) => {
  const html = `${header}
  ${script}
  <p><b>Registering Service Worker...</b></p>
  <p>This is ${new URL(c.req.url).pathname}</p>
  <p>Hello! from ${from}!</p>
  ${footer}
  `
  return c.html(html)
})

// Handler
const handler = (c) => {
  const html = `${header}
  <p>This is ${new URL(c.req.url).pathname}</p>
  <p>Hello! from ${from}!</p>
  ${footer}
  `
  return c.html(html)
}

// Route
app.get('/server/hello', handler)
app.get('/sw/hello', handler)

// addEventListener('fetch'...
app.fire()
