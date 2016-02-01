"use strict";

var request = require("request");
var _ = require("lodash");

var DEFAULT_ALLOWED_MIMES = ["image/.+", "application/x-obsidian-project"];

function downloadProxy(options) {
    options = options || {};

    var allowedMimes = new RegExp("^(" + _.union(DEFAULT_ALLOWED_MIMES, options.allowedMimes || []).join("|") + ")$");

    function downloadProxyMiddleware(req, res, next) {
        var url = req.params.url;

        if (!url) {
            res.sendStatus(400);
            return;
        }

        if (!_(url).startsWith("http")) {
            try {
                url = new Buffer(req.params.url, "base64").toString();
            } catch (error) {
                res.sendStatus(400);
                return;
            }
        }

        if (!_(url).startsWith("http")) {
            res.sendStatus(400);
            return;
        }

        try {
            request.get(url)
                .on("response", function(response) {
                    response.headers.server = "ObsidianProjectDownloadProxy";
                    if (response.statusCode != 200) {
                        res.sendStatus(404);
                    }
                    else if (!response.headers["content-type"].match(allowedMimes)) {
                        res.sendStatus(415);
                    } else {
                        this.pipe(res);
                    }
                }).on("error", function(error) {
                    console.error("[downloadProxy] Error: " + error); // jshint ignore:line
                    res.sendStatus(500);
                });
        } catch (error) {
            console.error("[downloadProxy] Error: " + error); // jshint ignore:line
            res.sendStatus(500);
        }
    }

    return downloadProxyMiddleware;
}

module.exports = downloadProxy;
