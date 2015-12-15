"use strict";

var request = require("request");
var _ = require("lodash");

var DEFAULT_ALLOWED_MIMES = ["image/.+", "application/x-wanadev-project"];

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

        try {
            request.get(url)
                .on("response", function(response) {
                    response.headers.server = "WanadevDownloadProxy";
                    if (!response.headers["content-type"].match(allowedMimes)) {
                        res.sendStatus(415);
                    }
                    if (response.statusCode != 200) {
                        res.sendStatus(404);
                    }
                }).on("error", function(error) {
                    console.error("[downloadProxy] Error: " + error); // jshint ignore:line
                    res.sendStatus(500);
                }).pipe(res);
        } catch (error) {
            console.error("[downloadProxy] Error: " + error); // jshint ignore:line
            res.sendStatus(500);
        }
    }

    return downloadProxyMiddleware;
}

module.exports = downloadProxy;
