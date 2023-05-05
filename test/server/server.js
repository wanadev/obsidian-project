"use strict";

var express = require("express");
var serveStatic = require("serve-static");
var bodyParser = require("body-parser");
var proxyMiddleware = require("obsidian-http-request/server/http-proxy");

var PORT = process.env.PORT || 3000;

var app = express();

app.use("/proxy", bodyParser.raw({type: "application/json"}));
app.use("/proxy", proxyMiddleware({
    maxContentLength: 5 * 1024 * 1024,
    allowedPorts: [80, 443, 3000]
}));

app.use("/files/", serveStatic(__dirname + "/static"));
app.use("/", serveStatic(__dirname + "/../../build/test/browser/"));

console.log("Starting Obsidian Project Proxy Test Server on 0.0.0.0:" + PORT);  // jshint ignore:line
app.listen(PORT);
