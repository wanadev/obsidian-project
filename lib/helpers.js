"use strict";

var _globalObject;
try {
    _globalObject = window;
} catch (error) {
    _globalObject = global;
}


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
     * Nodeify given promise with optional callback
     *
     * @param {Promise} promise 
     * @param {Function} [callback]
     */
    nodeify: function(promise, callback) {
        if (typeof(callback) !== "function") {
            return;
        }

        promise.then(function(value) {
            callback(null, value);
        }, function(error) {
            callback(error);
        });
    },

    /**
     * Get a UUID version 4 (RFC 4122).
     *
     * Try to use the browser's secure implementation if available (only
     * available with HTTPS and on localhost) else use a fallback
     * implementation.
     * @returns {string} A UUID version 4 string.
     */
    uuid4: function () {
        if (_globalObject.crypto && _globalObject.crypto.randomUUID) {
            return _globalObject.crypto.randomUUID();
        } else {
            return this.fallbackUuid4();
        }
    },

    /**
     * Generate a UUID version 4 (RFC 4122), fallback implementation.
     *
     * From: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     */
    fallbackUuid4: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, function (c) {
            var r = Math.trunc(Math.random() * 16);
            var v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};
