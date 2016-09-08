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

var defaultPM = new ProjectManager();
defaultPM.addStructure(new OwnStructure({ x: "0_0" }), "l0");
defaultPM.addStructure(new OwnStructure({ x: "0_1" }), "l0");
defaultPM.addStructure(new OwnStructure({ x: "0_2" }), "l0");
defaultPM.addStructure(new OwnStructure({ x: "1_0" }), "l1");
defaultPM.addStructure(new OwnStructure({ x: "1_1" }), "l1");
defaultPM.addStructure(new OwnStructure({ x: "2_0" }), "l2");

var pm;
pm = new ProjectManager();
pm.unserialize(defaultPM.serialize());

function expectLayer(layer1, layer2) {
    expect(layer1).to.have.length(layer2.length);
    for (var i = 0; i < layer1.length; ++i) {
        expect(layer1[i].x).to.be.eql(layer2[i].x);
    }
}

//----- Tests

describe("History", function() {

    beforeEach(function() {
        pm = new ProjectManager();
        pm.unserialize(defaultPM.serialize());
    });

    describe("LENGTH", function() {

        it("can set max length", function() {
            var history = new History(pm);
            expect(history.maxLength).to.equal(0);

            history.maxLength = 5;
            expect(history.maxLength).to.equal(5);

            var history2 = new History(pm, { maxLength: 3 });
            expect(history2.maxLength).to.equal(3);
        });

        it("is increased up to max length", function() {
            var history = new History(pm, { maxLength: 3 });
            expect(history.length).to.equal(0);

            history.snapshot();
            history.snapshot();
            expect(history.length).to.equal(2);

            history.snapshot();
            history.snapshot();
            expect(history.length).to.equal(3);
        });

        it("keeps max length the same", function() {
            var history = new History(pm, { maxLength: 3 });
            expect(history.maxLength).to.equal(3);

            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);

            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);
        });

        it("removes old snapshots when max length is changed", function() {
            var history = new History(pm, { maxLength: 3 });
            expect(history.maxLength).to.equal(3);
            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);

            history.maxLength = 1;
            expect(history.maxLength).to.equal(1);
            expect(history.length).to.equal(1);
        });

    });

    describe("NAVIGATING", function() {

        it("can go back", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();

            pm.layers.l1[0].x = "1_0b";
            history.snapshot();

            expect(pm.layers).to.only.have.keys("l0", "l1", "l2");
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expect(pm.layers.l1).to.have.length(defaultPM.layers.l1.length);
            expect(pm.layers.l1[0].x).to.be.equal("1_0b");
            expect(pm.layers.l1[1].x).to.be.eql(defaultPM.layers.l1[1].x);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);

            history.back();
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expectLayer(pm.layers.l1, defaultPM.layers.l1);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
        });

        it("can go back and forth", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();

            pm.layers.l1[0].x = "1_0b";
            history.snapshot();

            history.back();
            history.forward();
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expect(pm.layers.l1).to.have.length(defaultPM.layers.l1.length);
            expect(pm.layers.l1[0].x).to.be.equal("1_0b");
            expect(pm.layers.l1[1].x).to.be.eql(defaultPM.layers.l1[1].x);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
        });

        it("won't go too far", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            pm.layers.l1[0].x = "1_0b";
            history.snapshot();

            history.back();
            history.back(); // Too far!
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expectLayer(pm.layers.l1, defaultPM.layers.l1);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
            expect(history.try(-5)).to.be.equal(0);
            expect(history.try(5)).to.be.equal(1);

            history.forward();
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expect(pm.layers.l1).to.have.length(defaultPM.layers.l1.length);
            expect(pm.layers.l1[0].x).to.be.equal("1_0b");
            expect(pm.layers.l1[1].x).to.be.eql(defaultPM.layers.l1[1].x);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
            expect(history.try(-5)).to.be.equal(-1);
            expect(history.try(5)).to.be.equal(0);

            history.go(-2); // Too far!
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expectLayer(pm.layers.l1, defaultPM.layers.l1);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
            expect(history.try(-5)).to.be.equal(0);
            expect(history.try(5)).to.be.equal(1);
        });

        it("deletes old snapshots automatically", function() {
            var history = new History(pm, { maxLength: 5 });
            pm.layers.l1[0].x = "1_0_1";
            history.snapshot();
            pm.layers.l1[0].x = "1_0_2";
            history.snapshot();
            pm.layers.l1[0].x = "1_0_3";
            history.snapshot();
            pm.layers.l1[0].x = "1_0_4";
            history.snapshot();
            pm.layers.l1[0].x = "1_0_5";
            history.snapshot();
            pm.layers.l1[0].x = "1_0_6";
            history.snapshot();
            pm.layers.l1[0].x = "1_0_7";
            history.snapshot();

            history.go(-4);
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expect(pm.layers.l1[0].x).to.be.equal("1_0_3");
            expect(pm.layers.l1[1].x).to.be.eql(defaultPM.layers.l1[1].x);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
            expect(history.try(-1)).to.be.equal(0);
        });

        it("deletes branched snapshots automatically", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            history.snapshot();
            history.snapshot();
            history.snapshot();

            history.back();
            history.back();
            expect(history.length).to.be(4);

            history.snapshot();
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expectLayer(pm.layers.l1, defaultPM.layers.l1);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
            expect(history.length).to.be(3);
            expect(history.try(1)).to.be(0);
        });

    });

    describe("ORDER", function() {

        it("moves structures back to their correct layer", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            pm.setStructureLayer(pm.layers.l0[0], "l3");
            history.snapshot();

            history.back();
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expectLayer(pm.layers.l1, defaultPM.layers.l1);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
        });

        it("moves structures within its layer", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            pm.setStructureIndex(pm.layers.l0[0], 1);
            history.snapshot();

            history.back();
            expectLayer(pm.layers.l0, defaultPM.layers.l0);
            expectLayer(pm.layers.l1, defaultPM.layers.l1);
            expectLayer(pm.layers.l2, defaultPM.layers.l2);
        });

    });

    describe("CLEAR", function() {

        it("removes everything", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            history.snapshot();
            history.snapshot();

            history.clear();
            expect(history.length).to.be(0);
        });

    });

});
