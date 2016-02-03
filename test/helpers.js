"use strict";

var BASE_URL = location.protocol + "//" + location.host;

var expect = require("expect.js");
var helpers = require("../lib/helpers.js");

describe("helpers", function() {

    describe("createBlob", function() {

        it("is able to create a blob from given params", function() {
            var buffer = new Buffer(42);
            var blob = helpers.createBlob([buffer.toArrayBuffer()], {type: "application/octet-stream"});
            expect(blob).to.be.a(Blob);
            expect(blob.type).to.equal("application/octet-stream");
            expect(blob.size).to.equal(42);
        });

    });

});
