"use strict";

var expect = require("expect.js");
var httpRequest = require("obsidian-http-request");
var Q = require("q");

var History = require("../lib/history.js");
var ProjectManager = require("../lib/project-manager.js");
var Structure = require("../lib/structure.js");

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

var imageData64 = "data:image/png;base64,";
imageData64 += "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEUAAAD/AAD//";
imageData64 += "/9nGWQeAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9";
imageData64 += "8LEg0LF8qDZQAAAAA9SURBVAgdDcHBDQAhDAPBLQfRD/2c8opcBfILpcrzDCeY4PM";
imageData64 += "VbhUuC+sJ3zITTFB6Q+sNpbXpblFamwlO/JFNIn9yzLB/AAAAAElFTkSuQmCC";

function loadImage(url) {
    return Q.Promise(function(resolve, reject) {
        var image = new Image();
        image.onload = resolve.bind(undefined, image);
        image.onerror = reject;
        image.src = url;
        return image;
    });
}

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
            expect(history.simulate(-5)).to.be.equal(0);
            expect(history.simulate(5)).to.be.equal(1);

            history.forward();
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expect(project.layers.l1).to.have.length(defaultProject.layers.l1.length);
            expect(project.layers.l1[0].x).to.be.equal("1_0b");
            expect(project.layers.l1[1].x).to.be.eql(defaultProject.layers.l1[1].x);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.simulate(-5)).to.be.equal(-1);
            expect(history.simulate(5)).to.be.equal(0);

            history.go(-2); // Too far!
            expectLayer(project.layers.l0, defaultProject.layers.l0);
            expectLayer(project.layers.l1, defaultProject.layers.l1);
            expectLayer(project.layers.l2, defaultProject.layers.l2);
            expect(history.simulate(-5)).to.be.equal(0);
            expect(history.simulate(5)).to.be.equal(1);
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
            expect(history.simulate(-1)).to.be.equal(0);
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
            expect(history.simulate(1)).to.be(0);
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

        it("can revert blobs", function() {
            var history = new History(project, { maxLength: 5 });
            history.snapshot();

            var id = project.addBlobFromData64Url(imageData64);
            expect(project.$data.wprjFile.getBlob(id)).not.to.be(null);
            history.snapshot();

            history.back();
            expect(project.$data.wprjFile.getBlob(id)).to.be(null);

            history.forward();
            expect(project.$data.wprjFile.getBlob(id)).not.to.be(null);

            project.removeBlob(id);
            expect(project.$data.wprjFile.getBlob(id)).to.be(null);
            history.snapshot();

            history.back();
            expect(project.$data.wprjFile.getBlob(id)).not.to.be(null);
        });

        it("closes old blobs automatically", function() {
            var history = new History(project, { maxLength: 2 });
            var id = project.addBlobFromData64Url(imageData64);
            var url = project.getBlobAsUrl(id);
            history.snapshot();

            project.removeBlob(id);
            history.snapshot();

            return loadImage(url)
                .catch(function (e) {
                    throw new Error("ShouldNotBeCalled_InvalidURL");
                })
                .then(function() {
                    history.snapshot();
                })
                // The `revokeObjectURL` can take some time, so our test needs to wait
                .delay(100)
                .then(function() {
                    return loadImage(url);
                })
                .then(function() {
                    throw new Error("ShouldNotBeCalled_ValidURL");
                })
                .catch(function(e) {
                    expect(e).to.be.an(Event);
                    expect(e).not.to.match(/ShouldNotBeCalled/);
                });
        });

        it("allows to close blobs never seen in snapshots", function() {
            var history = new History(project, { maxLength: 5 });
            var id = project.addBlobFromData64Url(imageData64);
            var url = project.getBlobAsUrl(id);

            return loadImage(url)
                .catch(function (e) {
                    throw new Error("ShouldNotBeCalled_InvalidURL");
                })
                .then(function() {
                    project.removeBlob(id);
                })
                // The `revokeObjectURL` can take some time, so our test needs to wait
                .delay(100)
                .then(function() {
                    return loadImage(url);
                })
                .then(function() {
                    throw new Error("ShouldNotBeCalled_ValidURL");
                })
                .catch(function(e) {
                    expect(e).not.to.match(/ShouldNotBeCalled/);
                });
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
