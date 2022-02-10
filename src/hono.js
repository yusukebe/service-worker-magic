var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/utils/url.ts
var URL_REGEXP = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
var splitPath = (path) => {
  const paths = path.split(/\//);
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var getPattern = (label) => {
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    if (match[2]) {
      return [match[1], "(" + match[2] + ")"];
    } else {
      return [match[1], "(.+)"];
    }
  }
  return null;
};
var getPathFromURL = (url) => {
  const match = url.match(URL_REGEXP);
  if (match) {
    return match[5];
  }
  return "";
};
var isAbsoluteURL = (url) => {
  const match = url.match(URL_REGEXP);
  if (match && match[1]) {
    return true;
  }
  return false;
};

// src/node.ts
var METHOD_NAME_OF_ALL = "ALL";
var Result = class {
  constructor(handler, params) {
    this.handler = handler;
    this.params = params;
  }
};
var noRoute = () => {
  return null;
};
var Node = class {
  constructor(method, handler, children) {
    this.children = children || {};
    this.method = {};
    if (method && handler) {
      this.method[method] = handler;
    }
    this.middlewares = [];
  }
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitPath(path);
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      if (Object.keys(curNode.children).includes(p)) {
        curNode = curNode.children[p];
        continue;
      }
      curNode.children[p] = new Node();
      curNode = curNode.children[p];
    }
    curNode.method[method] = handler;
    return curNode;
  }
  search(method, path) {
    let curNode = this;
    const params = {};
    const parts = splitPath(path);
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      if (curNode.children["*"] && !curNode.children[p]) {
        const astNode = curNode.children["*"];
        if (Object.keys(astNode.children).length === 0) {
          curNode = astNode;
          break;
        }
      }
      const nextNode = curNode.children[p];
      if (nextNode) {
        curNode = nextNode;
        if (!(i == len - 1 && nextNode.children["*"])) {
          continue;
        }
      }
      let isWildcard = false;
      let isParamMatch = false;
      const keys = Object.keys(curNode.children);
      for (let j = 0, len2 = keys.length; j < len2; j++) {
        const key = keys[j];
        if (key === "*") {
          curNode = curNode.children["*"];
          isWildcard = true;
          break;
        }
        const pattern = getPattern(key);
        if (pattern) {
          const match = p.match(new RegExp(pattern[1]));
          if (match) {
            const k = pattern[0];
            params[k] = match[1];
            curNode = curNode.children[key];
            isParamMatch = true;
            break;
          }
          return noRoute();
        }
      }
      if (isWildcard && i === len - 1) {
        break;
      }
      if (isWildcard === false && isParamMatch === false) {
        return noRoute();
      }
    }
    const handler = curNode.method[METHOD_NAME_OF_ALL] || curNode.method[method];
    if (!handler) {
      return noRoute();
    }
    return new Result(handler, params);
  }
};

// src/compose.ts
var compose = (middleware) => {
  const errors = [];
  return function(context, next) {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length)
        fn = next;
      if (!fn)
        return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1))).catch((e) => {
          errors.push(e);
          throw errors[0];
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
};

// src/utils/http-status.ts
var getStatusText = (statusNumber) => {
  const text = statuses[statusNumber];
  return text;
};
var statuses = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  206: "Partial Content",
  301: "Moved Permanently",
  302: "Moved Temporarily",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Not Allowed",
  406: "Not Acceptable",
  408: "Request Time-out",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Request Entity Too Large",
  414: "Request-URI Too Large",
  415: "Unsupported Media Type",
  416: "Requested Range Not Satisfiable",
  421: "Misdirected Request",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Temporarily Unavailable",
  504: "Gateway Time-out",
  505: "HTTP Version Not Supported",
  507: "Insufficient Storage"
};

// src/context.ts
var Context = class {
  constructor(req, opts) {
    this.req = req;
    if (opts) {
      this.res = opts.res;
      this.env = opts.env;
      this.event = opts.event;
    }
    this._headers = {};
  }
  header(name, value) {
    if (this.res) {
      this.res.headers.set(name, value);
    }
    this._headers[name] = value;
  }
  status(number) {
    if (this.res) {
      console.warn("c.res.status is already set.");
      return;
    }
    this._status = number;
    this._statusText = getStatusText(number);
  }
  newResponse(data, init = {}) {
    init.status = init.status || this._status;
    init.statusText = init.statusText || this._statusText;
    init.headers = __spreadValues(__spreadValues({}, this._headers), init.headers);
    let length = 0;
    if (data) {
      if (data instanceof ArrayBuffer) {
        length = data.byteLength;
      } else if (typeof data == "string") {
        const Encoder = new TextEncoder();
        length = Encoder.encode(data).byteLength || 0;
      }
    }
    init.headers = __spreadValues(__spreadValues({}, init.headers), { "Content-Length": length.toString() });
    return new Response(data, init);
  }
  body(data, status = this._status, headers = this._headers) {
    return this.newResponse(data, {
      status,
      headers
    });
  }
  text(text, status = this._status, headers = {}) {
    if (typeof text !== "string") {
      throw new TypeError("text method arg must be a string!");
    }
    headers["Content-Type"] || (headers["Content-Type"] = "text/plain; charset=UTF-8");
    return this.body(text, status, headers);
  }
  json(object, status = this._status, headers = {}) {
    if (typeof object !== "object") {
      throw new TypeError("json method arg must be a object!");
    }
    const body = JSON.stringify(object);
    headers["Content-Type"] || (headers["Content-Type"] = "application/json; charset=UTF-8");
    return this.body(body, status, headers);
  }
  html(html, status = this._status, headers = {}) {
    if (typeof html !== "string") {
      throw new TypeError("html method arg must be a string!");
    }
    headers["Content-Type"] || (headers["Content-Type"] = "text/html; charset=UTF-8");
    return this.body(html, status, headers);
  }
  redirect(location, status = 302) {
    if (typeof location !== "string") {
      throw new TypeError("location must be a string!");
    }
    if (!isAbsoluteURL(location)) {
      const url = new URL(this.req.url);
      url.pathname = location;
      location = url.toString();
    }
    return this.newResponse(null, {
      status,
      headers: {
        Location: location
      }
    });
  }
};

// src/hono.ts
var METHOD_NAME_OF_ALL2 = "ALL";
var Router = class {
  constructor() {
    this.node = new Node();
  }
  add(method, path, handler) {
    this.node.insert(method, path, handler);
  }
  match(method, path) {
    return this.node.search(method, path);
  }
};
var Hono = class {
  constructor() {
    this.router = new Router();
    this.middlewareRouters = [];
    this.tempPath = "/";
  }
  get(arg, ...args) {
    return this.addRoute("get", arg, ...args);
  }
  post(arg, ...args) {
    return this.addRoute("post", arg, ...args);
  }
  put(arg, ...args) {
    return this.addRoute("put", arg, ...args);
  }
  head(arg, ...args) {
    return this.addRoute("head", arg, ...args);
  }
  delete(arg, ...args) {
    return this.addRoute("delete", arg, ...args);
  }
  options(arg, ...args) {
    return this.addRoute("options", arg, ...args);
  }
  patch(arg, ...args) {
    return this.addRoute("patch", arg, ...args);
  }
  all(arg, ...args) {
    return this.addRoute("all", arg, ...args);
  }
  route(path) {
    this.tempPath = path;
    return this;
  }
  use(path, middleware) {
    if (middleware.constructor.name !== "AsyncFunction") {
      throw new TypeError("middleware must be a async function!");
    }
    const router = new Router();
    router.add(METHOD_NAME_OF_ALL2, path, middleware);
    this.middlewareRouters.push(router);
  }
  addRoute(method, arg, ...args) {
    method = method.toUpperCase();
    if (typeof arg === "string") {
      this.tempPath = arg;
      this.router.add(method, arg, args);
    } else {
      args.unshift(arg);
      this.router.add(method, this.tempPath, args);
    }
    return this;
  }
  async matchRoute(method, path) {
    return this.router.match(method, path);
  }
  async dispatch(request, env, event) {
    const [method, path] = [request.method, getPathFromURL(request.url)];
    const result = await this.matchRoute(method, path);
    request.param = (key) => {
      if (result) {
        return result.params[key];
      }
    };
    request.header = (name) => {
      return request.headers.get(name);
    };
    request.query = (key) => {
      const url = new URL(c.req.url);
      return url.searchParams.get(key);
    };
    const handler = result ? result.handler[0] : this.notFound;
    const middleware = [];
    for (const mr of this.middlewareRouters) {
      const mwResult = mr.match(METHOD_NAME_OF_ALL2, path);
      if (mwResult) {
        middleware.push(mwResult.handler);
      }
    }
    const wrappedHandler = async (context, next) => {
      const res = await handler(context);
      if (!(res instanceof Response)) {
        throw new TypeError("response must be a instace of Response");
      }
      context.res = res;
      await next();
    };
    middleware.push(wrappedHandler);
    const composed = compose(middleware);
    const c = new Context(request, { env, event, res: null });
    await composed(c);
    return c.res;
  }
  async handleEvent(event) {
    return this.dispatch(event.request, {}, event).catch((err) => {
      return this.onError(err);
    });
  }
  async fetch(request, env, event) {
    return this.dispatch(request, env, event).catch((err) => {
      return this.onError(err);
    });
  }
  fire() {
    addEventListener("fetch", (event) => {
      event.respondWith(this.handleEvent(event));
    });
  }
  onError(err) {
    console.error(`${err}`);
    const message = "Internal Server Error";
    return new Response(message, {
      status: 500,
      headers: {
        "Content-Length": message.length.toString()
      }
    });
  }
  notFound() {
    const message = "Not Found";
    return new Response(message, {
      status: 404,
      headers: {
        "Content-Length": message.length.toString()
      }
    });
  }
};
export {
  Context,
  Hono
};
