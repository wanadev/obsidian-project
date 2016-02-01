# obsidian-project: Server Proxy

In order to download image or project from an URL, a server-side proxy is required (CORS workaround).

Example implementation using [Expess.js][express]

```javascript
"use strict";

var express = require("express");
var downloadProxy = require("obsidian-project/server/download-proxy.js");

var PORT = process.env.PORT || 3000;

var app = express();

app.use("/proxy/:url", downloadProxy());

console.log("Starting Obsidian Project Proxy Server on 0.0.0.0:" + PORT);
app.listen(PORT);
```

__NOTE:__ By default, proxy only accept the following mimetype: `image/.+` and `application/x-obsidian-project`.
To authorize more mimetype you can initialize the proxy middleware like this (regexp allowed):


```javascript
app.use("/proxy/:url", downloadProxy({
    allowedMimes: [
        "application/octet-stream",
        "application/x-obsidian-.+"
    ]
}));
```



[express]: http://expressjs.com/en/index.html