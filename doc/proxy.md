---
title: Server Proxy
menuOrder: 400
---

# Server Proxy

In order to download image or project from an URL, a server-side proxy is
required to workaround [CORS][] issues. To achieve that, Obsidian Project uses the
[Obsidian HTTP Request][obsidian-http] library.

__NOTE:__ This is required only if your project manager loads projects or
images using methods like `.openFromUrl()` or `.addBlobFromUrl()` with URLs
that do not share the [same origin][same-origin-policy] that the application
page.


## Server-Side Example:

To implement the server-side proxy you will need to use Node.js, the
[Express.js][expressjs] framework and the [body-parser][] package:

```javascript
"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var proxyMiddleware = require("obsidian-http-request/server/http-proxy");

var PORT = process.env.PORT || 3042;

var app = express();

app.use("/proxy", bodyParser.raw({type: "application/json"}));
app.use("/proxy", proxyMiddleware({
    maxContentLength: 5 * 1024 * 1024,  // Allows to transfer files of 5 MiB max
    allowedPorts: [80, 443]             // Allows to download from ports 80 (http) and 443 (https)
}));

console.log("Starting Obsidian HTTP Request Proxy Server on 0.0.0.0:" + PORT);
app.listen(PORT);
```

__NOTE:__ The proxy **MUST** runs on the same origin (same domain, same port) as
the application's HTML page.


[CORS]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[obsidian-http]: https://github.com/wanadev/obsidian-http-request
[same-origin-policy]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
[expressjs]: http://expressjs.com/
[body-parser]: https://www.npmjs.com/package/body-parser
