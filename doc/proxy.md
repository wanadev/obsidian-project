# obsidian-project: Server Proxy

In order to download image or project from an URL, a server-side proxy is required (CORS workaround).

This lib requires [obsidian-http-request](https://github.com/wanadev/obsidian-http-request) as server proxy.

Server-side example:

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

console.log("Starting Obsidian HTTP Request Proxy Test Server on 0.0.0.0:" + PORT);
app.listen(PORT);
```

__NOTE:__ The proxy **MUST** run on the same origin (same domain, same port) as the app's HTML page.
