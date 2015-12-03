"use strict";

var expect = require("expect.js");
var WProjectFile = require("wanadev-project-format");

var ProjectManager = require("../lib/ProjectManager.js");
var Structure = require("../lib/Structure.js");

describe("ProjectManager", function() {

    describe("MISC", function() {

        it("has the right default mimetype and file extention", function() {
            var project = new ProjectManager();
            expect(project.mimetype).to.equal("application/x-wanadev-project");
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
            expect(WProjectFile.isWanadevProjectFile(buffer)).to.be.ok();
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
                expect(WProjectFile.isWanadevProjectFile(b)).to.be.ok();
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
                expect(error).to.be(undefined);

                expect(project2.id).to.equal(project.id);
                expect(project2.layers).to.only.have.keys("default", "layer1");
                expect(project2.layers.layer1.length).to.equal(1);
                expect(project2.layers.default.length).to.equal(2);
                expect(project2.metadata).to.eql(project.metadata);

                expect(project2.serialize()).to.eql(project.serialize());

                done();
            });
        });

    });

    expect("BLOBS", function() {
    });

});
