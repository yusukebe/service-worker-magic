// src/utils/url.ts
var URL_REGEXP = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
var getPathFromURL = (url) => {
  const match = url.match(URL_REGEXP);
  if (match) {
    return match[5];
  }
  return "";
};

// src/middleware/logger/logger.ts
var humanize = (n, opts) => {
  const options = opts || {};
  const d = options.delimiter || ",";
  const s = options.separator || ".";
  n = n.toString().split(".");
  n[0] = n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + d);
  return n.join(s);
};
var time = (start) => {
  const delta = Date.now() - start;
  return humanize([
    delta < 1e4 ? delta + "ms" : Math.round(delta / 1e3) + "s"
  ]);
};
var LogPrefix = {
  Outgoing: "-->",
  Incoming: "<--",
  Error: "xxx"
};
var colorStatus = (status = 0) => {
  const out = {
    7: `\x1B[35m${status}\x1B[0m`,
    5: `\x1B[31m${status}\x1B[0m`,
    4: `\x1B[33m${status}\x1B[0m`,
    3: `\x1B[36m${status}\x1B[0m`,
    2: `\x1B[32m${status}\x1B[0m`,
    1: `\x1B[32m${status}\x1B[0m`,
    0: `\x1B[33m${status}\x1B[0m`
  };
  return out[status / 100 | 0];
};
function log(fn, prefix, method, path, status, elasped, contentLength) {
  const out = prefix === LogPrefix.Incoming ? `  ${prefix} ${method} ${path}` : `  ${prefix} ${method} ${path} ${colorStatus(status)} ${elasped} ${contentLength}`;
  fn(out);
}
var logger = (fn = console.log) => {
  return async (c, next) => {
    const { method } = c.req;
    const path = getPathFromURL(c.req.url);
    log(fn, LogPrefix.Incoming, method, path);
    const start = Date.now();
    try {
      await next();
    } catch (e) {
      log(fn, LogPrefix.Error, method, path, c.res.status || 500, time(start));
      throw e;
    }
    const len = parseFloat(c.res.headers.get("Content-Length"));
    const contentLength = isNaN(len) ? "0" : len < 1024 ? `${len}b` : `${len / 1024}kB`;
    log(fn, LogPrefix.Outgoing, method, path, c.res.status, time(start), contentLength);
  };
};
export {
  logger
};
