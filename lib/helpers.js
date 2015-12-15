"use strict";

var Q = require("q");

module.exports = {
    createBlob: function(parts, properties) {
        parts = parts || [];
        properties = properties || {};
        try {
            return new Blob(parts, properties);
        } catch (e) {
            if (e.name !== "TypeError") {
                throw e;
            }
            var BlobBuilder = window.BlobBuilder ||
                window.MSBlobBuilder ||
                window.MozBlobBuilder ||
                window.WebKitBlobBuilder;
            var builder = new BlobBuilder();
            for (var i = 0; i < parts.length; i += 1) {
                builder.append(parts[i]);
            }
            return builder.getBlob(properties.type);
        }
    },

    /**
     * Download the requested resource through a proxy (to avoid CORS).
     *
     * @param {String} The URL of the resource to download.
     * @param {Function} callback A node-like callback to get the result (optional).
     *
     * NOTE¹: if no callback is provided, this method returns a promise object.
     * NOTE²: the result value is an object: `{buffer: Buffer, mime: String}`
     */
    httpGet: function(url, callback) {
        var proxyUrl = "/proxy/";
        var requestUrl = proxyUrl + encodeURIComponent(url);
        return Q.Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            //xhr.responseType = "arraybuffer";  // Not supported by old webkit verisons... ¬_¬'
            xhr.overrideMimeType("text/plain; charset=x-user-defined");

            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) {
                    return;
                }
                if (xhr.status == 200) {
                    var buffer = new Buffer(xhr.response, "binary");
                    var mime = (xhr.getAllResponseHeaders().match(/content-type:\s*([^\s]+)/i) || ["", "application/octet-stream"])[1];
                    console.log(mime);  // jshint ignore:line

                    //var buffer = new Buffer(xhr.response);
                    resolve({buffer: buffer, mime: mime});
                } else {
                    throw new Error("HttpStatus" + xhr.status);
                }
            };

            xhr.onerror = reject;

            xhr.open("GET", requestUrl);
            xhr.send();
        }).nodeify(callback);
    }
};
