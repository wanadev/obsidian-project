"use strict";

var expect = require("expect.js");
var History = require("../lib/History.js");
var ProjectManager = require("../lib/ProjectManager.js");
var Structure = require("../lib/Structure.js");

//----- Setup

var OwnStructure = Structure.$extend({

    __name__: "OwnStructure",

    getX: function() {
        return this.$data.x;
    },

    setX: function(x) {
        this.$data.x = x;
    }

});

Structure.$register(OwnStructure);

var project;
var defaultProject = new ProjectManager();
defaultProject.addStructure(new OwnStructure({ x: "0_0" }), "l0");
defaultProject.addStructure(new OwnStructure({ x: "0_1" }), "l0");
defaultProject.addStructure(new OwnStructure({ x: "0_2" }), "l0");
defaultProject.addStructure(new OwnStructure({ x: "1_0" }), "l1");
defaultProject.addStructure(new OwnStructure({ x: "1_1" }), "l1");
defaultProject.addStructure(new OwnStructure({ x: "2_0" }), "l2");

var buffer = new Buffer([
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

function expectLayer(layer1, layer2) {
    expect(layer1).to.have.length(layer2.length);
    for (var i = 0; i < layer1.length; ++i) {
        expect(layer1[i].x).to.be.eql(layer2[i].x);
    }
}

//----- Tests

describe("History", function() {

    beforeEach(function() {
        project = new ProjectManager();
        project.unserialize(defaultProject.serialize());
    });

    describe("LENGTH", function() {

        it("can set max length", function() {
            var history = new History(project);
            expect(history.maxLength).to.equal(0);

            history.maxLength = 5;
            expect(history.maxLength).to.equal(5);

            var history2 = new History(project, { maxLength: 3 });
            expect(history2.maxLength).to.equal(3);
        });

        it("is increased up to max length", function() {
            var history = new History(project, { maxLength: 3 });
            expect(history.length).to.equal(0);

            history.snapshot();
            history.snapshot();
            expect(history.length).to.equal(2);

            history.snapshot();
            history.snapshot();
            expect(history.length).to.equal(3);
        });

        it("keeps max length the same", function() {
            var history = new History(project, { maxLength: 3 });
            expect(history.maxLength).to.equal(3);

            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);

            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);
        });

        it("removes old snapshots when max length is changed", function() {
            var history = new History(project, { maxLength: 3 });
            expect(history.maxLength).to.equal(3);
            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);

            history.maxLength = 1;
            expect(history.maxLength).to.equal(1);
            expect(history.length).to.equal(1);
        });

    });

    describe("STRUCTURES", function() {

        it("can go back", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();

            project.layers.l1[0].x = "1_0b";
            history.snapshot();

            expect(project.layers).to.only.have.keys("l0", "l1", "l2");
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expect(project.layers.l1).to.have.length(defaultProject.layers.l1.length);
            expect(project.layers.l1[0].x).to.be.equal("1_0b");
            expect(project.layers.l1[1].x).to.be.eql(defaultProject.layers.l1[1].x);
            expectLayer(project.layers.l2, defaultProject.layers.l2);

            history.back();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
        });

        it("can go back and forth", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();

            project.layers.l1[0].x = "1_0b";
            history.snapshot();

            history.back();
            history.forward();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expect(project.layers.l1).to.have.length(defaultProject.layers.l1.length);
            expect(project.layers.l1[0].x).to.be.equal("1_0b");
            expect(project.layers.l1[1].x).to.be.eql(defaultProject.layers.l1[1].x);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
        });

        it("won't go too far", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();
            project.layers.l1[0].x = "1_0b";
            history.snapshot();

            history.back();
            history.back(); // Too far!
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.try(-5)).to.be.equal(0);
            expect(history.try(5)).to.be.equal(1);

            history.forward();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expect(project.layers.l1).to.have.length(defaultProject.layers.l1.length);
            expect(project.layers.l1[0].x).to.be.equal("1_0b");
            expect(project.layers.l1[1].x).to.be.eql(defaultProject.layers.l1[1].x);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.try(-5)).to.be.equal(-1);
            expect(history.try(5)).to.be.equal(0);

            history.go(-2); // Too far!
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.try(-5)).to.be.equal(0);
            expect(history.try(5)).to.be.equal(1);
        });

        it("deletes old snapshots automatically", function() {
            var history = new History(project, { maxLength: 5 });
            project.layers.l1[0].x = "1_0_1";
            history.snapshot();
            project.layers.l1[0].x = "1_0_2";
            history.snapshot();
            project.layers.l1[0].x = "1_0_3";
            history.snapshot();
            project.layers.l1[0].x = "1_0_4";
            history.snapshot();
            project.layers.l1[0].x = "1_0_5";
            history.snapshot();
            project.layers.l1[0].x = "1_0_6";
            history.snapshot();
            project.layers.l1[0].x = "1_0_7";
            history.snapshot();

            history.go(-4);
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expect(project.layers.l1[0].x).to.be.equal("1_0_3");
            expect(project.layers.l1[1].x).to.be.eql(defaultProject.layers.l1[1].x);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.try(-1)).to.be.equal(0);
        });

        it("deletes branched snapshots automatically", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();
            history.snapshot();
            history.snapshot();
            history.snapshot();

            history.back();
            history.back();
            expect(history.length).to.be(4);

            history.snapshot();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.length).to.be(3);
            expect(history.try(1)).to.be(0);
        });

    });

    describe("ORDER", function() {

        it("moves structures back to their correct layer", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();
            project.setStructureLayer(project.layers.l0[0], "l3");
            history.snapshot();

            history.back();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
        });

        it("moves structures within its layer", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();
            project.setStructureIndex(project.layers.l0[0], 1);
            history.snapshot();

            history.back();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
        });

    });

    describe("BLOBS", function() {

        it.skip("can revert blobs", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();

            var id = project.addBlobFromBuffer(buffer);
            expect(project.$data.wprjFile.getBlob(id)).to.be(buffer);
            history.snapshot();

            history.back();
            expect(project.$data.wprjFile.getBlob(id)).to.be(null);

            history.forward();
            expect(project.$data.wprjFile.getBlob(id)).to.be(buffer);

            project.removeBlob(id);
            expect(project.$data.wprjFile.getBlob(id)).to.be(null);
            history.snapshot();

            history.back();
            expect(project.$data.wprjFile.getBlob(id)).to.be(buffer);
        });

        it.skip("closes old blobs automatically", function() {
            var history = new History(project, { maxLength: 2 });
            var id = project.addBlobFromBuffer(buffer);
            var blob = project.getBlob(id);
            history.snapshot();

            project.removeBlob(id);
            history.snapshot();
            expect(blob.isClosed).to.be(false);

            history.snapshot();
            expect(blob.isClosed).to.be(true);
        });

        it.skip("closes blobs never seen in snapshots", function() {
            var history = new History(project, { maxLength: 5 });
            var id = project.addBlobFromBuffer(buffer);
            var blob = project.getBlob(id);
            project.removeBlob(id);
            expect(blob.isClosed).to.be(true);
        });

    });

    describe("CLEAR", function() {

        it("removes everything", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();
            history.snapshot();
            history.snapshot();

            history.clear();
            expect(history.length).to.be(0);
        });

    });

});
