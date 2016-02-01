"use strict";

var BASE_URL = location.protocol + "//" + location.host;

var imageBuffer = new Buffer([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
    0x02, 0x03, 0x00, 0x00, 0x00, 0x62, 0x9d, 0x17, 0xf2, 0x00, 0x00, 0x00,
    0x09, 0x50, 0x4c, 0x54, 0x45, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0xff,
    0xff, 0xff, 0x67, 0x19, 0x64, 0x1e, 0x00, 0x00, 0x00, 0x01, 0x62, 0x4b,
    0x47, 0x44, 0x00, 0x88, 0x05, 0x1d, 0x48, 0x00, 0x00, 0x00, 0x09, 0x70,
    0x48, 0x59, 0x73, 0x00, 0x00, 0x0e, 0xc4, 0x00, 0x00, 0x0e, 0xc4, 0x01,
    0x95, 0x2b, 0x0e, 0x1b, 0x00, 0x00, 0x00, 0x07, 0x74, 0x49, 0x4d, 0x45,
    0x07, 0xdf, 0x0b, 0x12, 0x0d, 0x0b, 0x17, 0xca, 0x83, 0x65, 0x00, 0x00,
    0x00, 0x00, 0x3d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x1d, 0x0d, 0xc1, 0xc1,
    0x0d, 0x00, 0x21, 0x0c, 0x03, 0xc1, 0x2d, 0x07, 0xd1, 0x0f, 0xfd, 0x9c,
    0xf2, 0x8a, 0x5c, 0x05, 0xf2, 0x0b, 0xa5, 0xca, 0xf3, 0x0c, 0x27, 0x98,
    0xe0, 0xf3, 0x15, 0x6e, 0x15, 0x2e, 0x0b, 0xeb, 0x09, 0xdf, 0x32, 0x13,
    0x4c, 0x50, 0x7a, 0x43, 0xeb, 0x0d, 0xa5, 0xb5, 0xe9, 0x6e, 0x51, 0x5a,
    0x9b, 0x09, 0x4e, 0xfc, 0x91, 0x4d, 0x22, 0x7f, 0x72, 0xcc, 0xb0, 0x7f,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
]);

var imageData64 = "data:image/png;base64,";
imageData64 += "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEUAAAD/AAD//";
imageData64 += "/9nGWQeAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9";
imageData64 += "8LEg0LF8qDZQAAAAA9SURBVAgdDcHBDQAhDAPBLQfRD/2c8opcBfILpcrzDCeY4PM";
imageData64 += "VbhUuC+sJ3zITTFB6Q+sNpbXpblFamwlO/JFNIn9yzLB/AAAAAElFTkSuQmCC";

var expect = require("expect.js");
var ObsidianProjectFile = require("obsidian-file");

var ProjectManager = require("../lib/ProjectManager.js");
var Structure = require("../lib/Structure.js");
var helpers = require("../lib/helpers.js");

describe("ProjectManager", function() {

    describe("MISC", function() {

        it("has the right default mimetype and file extention", function() {
            var project = new ProjectManager();
            expect(project.mimetype).to.equal("application/x-obsidian-project");
            expect(project.fileExt).to.equal("wprj");

            var project2 = new ProjectManager({
                mimetype: "application/x-test-mime",
                fileExt: "test"
            });
            expect(project2.mimetype).to.equal("application/x-test-mime");
            expect(project2.fileExt).to.equal("test");
        });

        it("can read and write WPRJ options", function(done) {
            var project = new ProjectManager();

            expect(project.wprjOptions).to.eql({type: "GENERIC", metadataFormat: 1, projectFormat: 1, blobIndexFormat: 1});

            project.wprjOptions = {type: "TESTTYPE"};
            expect(project.wprjOptions).to.eql({type: "TESTTYPE", metadataFormat: 1, projectFormat: 1, blobIndexFormat: 1});

            project.wprjOptions.metadataFormat = 0;
            setTimeout(function() {
                expect(project.wprjOptions).to.eql({type: "TESTTYPE", metadataFormat: 0, projectFormat: 1, blobIndexFormat: 1});
                done();
            }, 0);
        });

        it("can read and write WPRJ metadata", function () {
            var project = new ProjectManager();

            expect(project.metadata).to.eql({});

            project.metadata = {data1: "foo"};
            expect(project.metadata).to.eql({data1: "foo"});

            project.metadata.data2 = "bar";
            expect(project.metadata).to.eql({data1: "foo", data2: "bar"});
        });

    });

    describe("NEW PROJECT", function() {

        it("can create new empty projects", function() {
            var project = new ProjectManager({
                metadata: {
                    test: "foo"
                },
                wprjOptions: {
                    type: "FOOBARBAZ"
                }
            });
            expect(project.metadata).to.eql({test: "foo"});
            expect(project.wprjOptions.type).to.equal("FOOBARBAZ");

            project.newEmptyProject({hello: "world"});
            expect(project.metadata).to.eql({hello: "world"});
            expect(project.wprjOptions.type).to.equal("FOOBARBAZ");
        });

    });

    describe("LAYERS", function() {

        it("can add one or more layers", function() {
            var project = new ProjectManager();

            project.addLayers("layer1");
            expect(project.layers).to.only.have.keys("layer1");

            project.addLayers(["layer2", "layer3"]);
            expect(project.layers).to.only.have.keys("layer1", "layer2", "layer3");

            project.addLayers("layer4", "layer5");
            expect(project.layers).to.only.have.keys("layer1", "layer2", "layer3", "layer4", "layer5");

            project.addLayers("layer6", ["layer7"]);
            expect(project.layers).to.only.have.keys("layer1", "layer2", "layer3", "layer4", "layer5", "layer6", "layer7");
        });

        it("can remove one or more layers (with contained structures)", function() {
            var project = new ProjectManager();
            project.addLayers("layer1", "layer2", "layer3", "layer4", "layer5", "layer6", "layer7");

            project.removeLayers("layer1");
            expect(project.layers).to.only.have.keys("layer2", "layer3", "layer4", "layer5", "layer6", "layer7");

            project.removeLayers(["layer2", "layer3"]);
            expect(project.layers).to.only.have.keys("layer4", "layer5", "layer6", "layer7");

            project.removeLayers("layer4", "layer5");
            expect(project.layers).to.only.have.keys("layer6", "layer7");

            project.removeLayers("layer6", "layer7");
            expect(project.layers).to.be.empty();

            // TODO test with layer that contains structures
        });

        it("can return a layer by name (or an empty array if th elayer does not exist)", function() {
            var project = new ProjectManager();
            expect(project.getLayer("foobar")).to.be.an(Array);
            expect(project.getLayer("foobar")).to.be.empty();

            project.addLayers("layer1");
            expect(project.getLayer("layer1")).to.be.an(Array);
            expect(project.getLayer("layer1")).to.be.empty();
            project.$data.layers.layer1.push("foo");
            expect(project.getLayer("layer1").length).to.equal(1);
        });

        it("has an empty layer object on new projects", function() {
            var project = new ProjectManager();
            expect(project.layers).to.be.empty();
            project.addLayers("foo");
            project.newEmptyProject();
            expect(project.layers).to.be.empty();
        });

    });

    describe("STRUCTURES", function() {

        it("can add/remove a structure to/from any layer", function() {
            var project = new ProjectManager();
            var structure = new Structure();

            project.addStructure(structure);

            expect(structure.project).to.be(project);
            expect(project.structures[structure.id]).to.be(structure);
            expect(structure.layer).to.be(project.layers.default);
            expect(project.layers.default[0]).to.be(structure);

            project.addStructure(structure, "foo");

            expect(structure.project).to.be(project);
            expect(structure.layer).to.be(project.layers.foo);
            expect(project.layers.default).to.be.empty();
            expect(project.layers.foo[0]).to.be(structure);

            project.removeStructure(structure);

            expect(project.structures).to.be.empty();
            expect(project.layers.default).to.be.empty();
            expect(project.layers.foo).to.be.empty();
            expect(structure.project).to.be(undefined);

            project.addStructure(structure, "foo");
            expect(project.structures[structure.id]).to.be(structure);
            project.removeStructure(structure.id);
            expect(project.structures).to.be.empty();
        });

    });

    describe("OPEN / SAVE", function() {

        var project = new ProjectManager();

        var structure1 = new Structure();
        var structure2 = new Structure();
        var structure3 = new Structure();

        project.addStructure(structure1, "layer1");
        project.addStructure(structure2);
        project.addStructure(structure3);

        project.metadata.test = "Hello!";

        it("can be serialized", function() {
            var serialized = project.serialize();
            expect(serialized).to.only.have.keys("__name__", "id", "layers");
            expect(serialized.layers).to.only.have.keys("default", "layer1");
            expect(serialized.layers.layer1.length).to.equal(1);
            expect(serialized.layers.default.length).to.equal(2);
        });

        it("can be unserialized", function() {
            var serialized = project.serialize();
            var project2 = new ProjectManager();

            project2.unserialize(serialized);

            expect(project2.id).to.equal(project.id);
            expect(project2.layers).to.only.have.keys("default", "layer1");
            expect(project2.layers.layer1.length).to.equal(1);
            expect(project2.layers.default.length).to.equal(2);

            expect(project2.serialize()).to.eql(serialized);
        });

        it("can export the project as a Node Buffer", function() {
            var buffer = project.saveAsBuffer();
            expect(ObsidianProjectFile.isObsidianProjectFile(buffer)).to.be.ok();
        });

        it("can export the project as a data64 URL", function() {
            var data64 = project.saveAsData64Url();
            expect(data64).to.be.a("string");
            expect(data64).to.contain("data:" + project.mimetype + ";base64,");
        });

        it("can export the project as a Blob", function(done) {
            var buffer = project.saveAsBuffer();
            var blob = project.saveAsBlob();

            expect(blob).to.be.a(Blob);
            expect(blob.size).to.equal(buffer.length);

            var reader = new FileReader();
            reader.onload = function(event) {
                var b = new Buffer(event.target.result);
                expect(ObsidianProjectFile.isObsidianProjectFile(b)).to.be.ok();
                expect(b.toString()).to.equal(buffer.toString());
                done();
            };
            reader.readAsArrayBuffer(blob);
        });

        it("can open the project from a buffer", function() {
            var project2 = new ProjectManager();
            project2.openFromBuffer(project.saveAsBuffer());

            expect(project2.id).to.equal(project.id);
            expect(project2.layers).to.only.have.keys("default", "layer1");
            expect(project2.layers.layer1.length).to.equal(1);
            expect(project2.layers.default.length).to.equal(2);
            expect(project2.metadata).to.eql(project.metadata);

            expect(project2.serialize()).to.eql(project.serialize());
        });

        it("can open the project from a data64 URL", function() {
            var project2 = new ProjectManager();
            project2.openFromData64Url(project.saveAsData64Url());

            expect(project2.id).to.equal(project.id);
            expect(project2.layers).to.only.have.keys("default", "layer1");
            expect(project2.layers.layer1.length).to.equal(1);
            expect(project2.layers.default.length).to.equal(2);
            expect(project2.metadata).to.eql(project.metadata);

            expect(project2.serialize()).to.eql(project.serialize());
        });

        it("can open the project from a Blob", function(done) {
            var project2 = new ProjectManager();
            project2.openFromBlob(project.saveAsBlob(), function(error) {
                expect(error).to.be(null);

                expect(project2.id).to.equal(project.id);
                expect(project2.layers).to.only.have.keys("default", "layer1");
                expect(project2.layers.layer1.length).to.equal(1);
                expect(project2.layers.default.length).to.equal(2);
                expect(project2.metadata).to.eql(project.metadata);

                expect(project2.serialize()).to.eql(project.serialize());

                done();
            });
        });

        it("can open the project from a Blob (promise)", function() {
            var project2 = new ProjectManager();

            return project2.openFromBlob(project.saveAsBlob())
                .then(function () {
                    expect(project2.id).to.equal(project.id);
                    expect(project2.layers).to.only.have.keys("default", "layer1");
                    expect(project2.layers.layer1.length).to.equal(1);
                    expect(project2.layers.default.length).to.equal(2);
                    expect(project2.metadata).to.eql(project.metadata);

                    expect(project2.serialize()).to.eql(project.serialize());
                });
        });

        it("can open the project from an URL", function(done) {
            var project2 = new ProjectManager();

            project2.openFromUrl(BASE_URL + "/files/project.wprj", function(resposne) {
                expect(project2.metadata.foo).to.equal("bar");
                done();
            });
        });

        it("can open the project from an URL (promise)", function() {
            var project2 = new ProjectManager();

            return project2.openFromUrl(BASE_URL + "/files/project.wprj")
                .then(function() {
                    expect(project2.metadata.foo).to.equal("bar");
                });
        });

    });

    describe("BLOBS", function() {

        it("can add a blob from a Buffer", function() {
            var project = new ProjectManager();

            var id = project.addBlobFromBuffer(imageBuffer);
            expect(project.$data.wprjFile.getBlob(id)).to.be(imageBuffer);
            expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("application/octet-stream");

            id = project.addBlobFromBuffer(imageBuffer, {id: "blob1"});
            expect(id).to.equal("blob1");
            expect(project.$data.wprjFile.getBlob(id)).to.be(imageBuffer);

            id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});
            expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("image/png");

            id = project.addBlobFromBuffer(imageBuffer, {metadata: {"hello": "world"}});
            expect(project.$data.wprjFile.getBlobRecord(id).metadata).to.eql({"hello": "world"});
        });

        it("can add a blob from a Blob", function(done) {
            var project = new ProjectManager();
            var blob = helpers.createBlob([imageBuffer.toArrayBuffer()], {type: "image/png"});

            project.addBlob(blob, {}, function(error, id) {
                expect(error).to.be(null);
                expect(id).to.be.a("string");
                expect(project.$data.wprjFile.getBlob(id)).to.eql(imageBuffer);
                done();
            });
        });

        it("can add a blob from a Blob (promise)", function() {
            var project = new ProjectManager();
            var blob = helpers.createBlob([imageBuffer.toArrayBuffer()], {type: "image/png"});

            return project.addBlob(blob)
                .then(function(id) {
                    expect(id).to.be.a("string");
                    expect(project.$data.wprjFile.getBlob(id)).to.eql(imageBuffer);
                });
        });

        it("can add a blob from a data64 URL", function() {
            var project = new ProjectManager();

            var id = project.addBlobFromData64Url(imageData64);
            expect(project.$data.wprjFile.getBlob(id)).to.eql(imageBuffer);
            expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("image/png");

            id = project.addBlobFromData64Url(imageData64, {id: "blob1"});
            expect(id).to.equal("blob1");
            expect(project.$data.wprjFile.getBlob(id)).to.eql(imageBuffer);

            id = project.addBlobFromData64Url(imageData64, {mime: "application/x-test"});
            expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("application/x-test");

            id = project.addBlobFromData64Url(imageData64, {metadata: {"hello": "world"}});
            expect(project.$data.wprjFile.getBlobRecord(id).metadata).to.eql({"hello": "world"});
        });

        it("can add a blob from a an Image", function(done) {
            var project = new ProjectManager();
            var img = new Image();
            img.onload = function(event) {
                var id = project.addBlobFromImage(img);
                expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("image/png");
                id = project.addBlobFromImage(img, {mime: "image/jpeg"});
                expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("image/jpeg");
                id = project.addBlobFromImage(img, {mime: "image/gif"});
                expect(project.$data.wprjFile.getBlobRecord(id).mime).to.equal("image/png");
                done();
            };
            img.src = imageData64;
        });

        it("can add a blob from an URL", function(done) {
            var project2 = new ProjectManager();

            project2.addBlobFromUrl(BASE_URL + "/files/image.png", null, function(error, id) {
                expect(error).to.be(null);
                expect(id).to.be.a("string");
                var buffer = project2.getBlobAsBuffer(id);
                expect(buffer instanceof Uint8Array || buffer instanceof Buffer).to.be.ok();
                expect(buffer.length).to.equal(816);
                expect(buffer[0]).to.equal(0x89);
                expect(buffer[1]).to.equal(0x50);
                expect(buffer[2]).to.equal(0x4E);
                expect(buffer[3]).to.equal(0x47);
                var blob = project2.getBlob(id);
                expect(blob.type).to.equal("image/png");

                project2.addBlobFromUrl(BASE_URL + "/files/image.png", {mime: "application/x-test", metadata: {foo: "bar"}}, function(error, id) {
                    expect(error).to.be(null);
                    expect(id).to.be.a("string");
                    var blob = project2.getBlob(id);
                    expect(blob.type).to.equal("application/x-test");
                    expect(project2.getBlobMetadata(id)).to.eql({foo: "bar"});

                    done();
                });
            });
        });

        it("can add a blob from an URL (promise)", function() {
            var project2 = new ProjectManager();

            return project2.addBlobFromUrl(BASE_URL + "/files/image.png")
                .then(function(id) {
                    expect(id).to.be.a("string");
                    var buffer = project2.getBlobAsBuffer(id);
                    expect(buffer instanceof Uint8Array || buffer instanceof Buffer).to.be.ok();
                    expect(buffer.length).to.equal(816);
                    expect(buffer[0]).to.equal(0x89);
                    expect(buffer[1]).to.equal(0x50);
                    expect(buffer[2]).to.equal(0x4E);
                    expect(buffer[3]).to.equal(0x47);
                    var blob = project2.getBlob(id);
                    expect(blob.type).to.equal("image/png");
                })
                .then(project2.addBlobFromUrl.bind(null, BASE_URL + "/files/image.png", {
                    mime: "application/x-test",
                    metadata: {
                        foo: "bar"
                    }
                }))
                .then(function(id) {
                    expect(id).to.be.a("string");
                    var blob = project2.getBlob(id);
                    expect(blob.type).to.equal("application/x-test");
                    expect(project2.getBlobMetadata(id)).to.eql({
                        foo: "bar"
                    });
                });
        });

        it("can return a blob as Buffer", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});

            var buffer = project.getBlobAsBuffer(id);
            expect(buffer).to.eql(imageBuffer);
        });

        it("can return a blob as Blob", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});

            var blob = project.getBlob(id);
            expect(blob.size).to.equal(imageBuffer.length);
            expect(blob.type).to.equal("image/png");
        });

        it("can return a blob as data64 URL", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});

            var data64 = project.getBlobAsData64Url(id);
            expect(data64).to.contain("data:image/png;base64,");
        });

        it("can return a blob as URL", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});

            var url = project.getBlobAsUrl(id);
            expect(url).to.be.a("string");
        });

        it("can return a blob as Image", function(done) {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});

            project.getBlobAsImage(id, function(error, image) {
                expect(image).to.be.an(Image);
                expect(error).to.be(null);
                done();
            });
        });

        it("can return a blob as Image (promise)", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {mime: "image/png"});

            return project.getBlobAsImage(id)
                .then(function(image) {
                    expect(image).to.be.an(Image);
                });
        });

        it("can return blob's metadata", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer, {metadata: {"hello": "world"}});
            expect(project.getBlobMetadata(id)).to.eql({"hello": "world"});
        });

        it("can remove a blob", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer);
            expect(project.$data.wprjFile.blobExists(id)).to.be.ok();
            project.removeBlob(id);
            expect(project.$data.wprjFile.blobExists(id)).not.to.be.ok();
        });

        it("can check if a blob exists", function() {
            var project = new ProjectManager();
            var id = project.addBlobFromBuffer(imageBuffer);
            expect(project.blobExists(id)).to.be.ok();
            project.removeBlob(id);
            expect(project.blobExists(id)).not.to.be.ok();
        });

        it("can list all blobs", function() {
            var project = new ProjectManager();
            var id1 = project.addBlobFromBuffer(imageBuffer);
            var id2 = project.addBlobFromBuffer(imageBuffer);
            expect(project.getBlobList().length).to.equal(2);
            expect(project.getBlobList()).to.contain(id1);
            expect(project.getBlobList()).to.contain(id2);
        });
    });

});
