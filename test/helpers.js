"use strict";

var BASE_URL = location.protocol + "//" + location.host;

var expect = require("expect.js");
var helpers = require("../lib/helpers.js");

describe("helpers", function() {

    describe("createBlob", function() {

        it("is able to create a blob from given params", function() {
            var buffer = Buffer.alloc(42);
            var blob = helpers.createBlob([buffer], {type: "application/octet-stream"});
            expect(blob).to.be.a(Blob);
            expect(blob.type).to.equal("application/octet-stream");
            expect(blob.size).to.equal(42);
        });

    });

    describe("uuid4", () => {
        it("can generate a UUID v4 conform to RFC4122", () => {
            const uuid4_1 = helpers.uuid4();
            const uuid4_2 = helpers.uuid4();
            expect(uuid4_1).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(uuid4_2).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(uuid4_1).not.to.equal(uuid4_2);
        });
    });

    describe("fallbackUuid4", () => {
        it("can generate a UUID v4 (random)", () => {
            expect(helpers.fallbackUuid4()).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });
    });


});
