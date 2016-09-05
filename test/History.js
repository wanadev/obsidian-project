"use strict";

var lodash = require("lodash");
var expect = require("expect.js");
var History = require("../lib/History.js");

var pm;
var defaultPM = {
    layers: {
        l0: [{ id: "0_0" }, { id: "0_1" }, { id: "0_2" }],
        l1: [{ id: "1_0" }, { id: "1_1" }],
        l2: [{ id: "2_0" }]
    }
};

describe("History", function() {

    beforeEach(function() {
        pm = lodash.clone(defaultPM);
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

        it.skip("is increased up to max length", function() {
            var history = new History(pm, { maxLength: 3 });
            expect(history.length).to.equal(0);

            history.snapshot();
            history.snapshot();
            expect(history.length).to.equal(2);

            history.snapshot();
            history.snapshot();
            expect(history.length).to.equal(3);
        });

        it.skip("keeps max length the same", function() {
            var history = new History(pm, { maxLength: 3 });
            expect(history.maxLength).to.equal(3);

            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);

            history.snapshot();
            history.snapshot();
            expect(history.maxLength).to.equal(3);
        });

        it.skip("removes old snapshots when max length is changed", function() {
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

        it.skip("can go back", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();

            pm.layers.l1 = [{ id: "1_0", extra: "1_0" }];
            pm.layers.l3 = [{ id: "3_0" }];
            history.snapshot();

            expect(pm).to.only.have.key("layers");
            expect(pm.layers).to.only.have.keys("l0", "l1", "l2", "l3");
            expect(pm.layers.l0).to.be.eql(defaultPM.layers.l0);
            expect(pm.layers.l1).to.have.length(1);
            expect(pm.layers.l1[0]).to.only.have.keys("id", "extra");
            expect(pm.layers.l1[0].id).to.be.equal("1_0");
            expect(pm.layers.l1[0].extra).to.be.equal("1_0");
            expect(pm.layers.l2).to.be.eql(defaultPM.layers.l1);
            expect(pm.layers.l3).to.have.length(1);
            expect(pm.layers.l3[0]).to.only.have.key("id");
            expect(pm.layers.l3[0].id).to.be.equal("3_0");

            history.back();
            expect(pm).to.eql(defaultPM);
        });

        it.skip("can go back and forth", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();

            pm.layers.l1 = [{ id: "1_0", extra: "1_0" }];
            pm.layers.l3 = [{ id: "3_0" }];
            history.snapshot();

            history.back();
            history.forward();
            expect(pm).to.only.have.key("layers");
            expect(pm.layers).to.only.have.keys("l0", "l1", "l2", "l3");
            expect(pm.layers.l0).to.be.eql(defaultPM.layers.l0);
            expect(pm.layers.l1).to.have.length(1);
            expect(pm.layers.l1[0]).to.only.have.keys("id", "extra");
            expect(pm.layers.l1[0].id).to.be.equal("1_0");
            expect(pm.layers.l1[0].extra).to.be.equal("1_0");
            expect(pm.layers.l2).to.be.eql(defaultPM.layers.l1);
            expect(pm.layers.l3).to.have.length(1);
            expect(pm.layers.l3[0]).to.only.have.key("id");
            expect(pm.layers.l3[0].id).to.be.equal("3_0");
        });

        it.skip("won't go too far", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            pm.layers.l3 = [{ id: "3_0" }];
            history.snapshot();

            history.back();
            history.back(); // Too far!
            expect(pm).to.eql(defaultPM);

            history.forward();
            expect(pm).to.only.have.key("layers");
            expect(pm.layers).to.only.have.keys("l0", "l1", "l2", "l3");
            expect(pm.layers.l0).to.be.eql(defaultPM.layers.l0);
            expect(pm.layers.l1).to.be.eql(defaultPM.layers.l1);
            expect(pm.layers.l2).to.be.eql(defaultPM.layers.l2);
            expect(pm.layers.l3).to.have.length(1);
            expect(pm.layers.l3[0]).to.only.have.key("id");
            expect(pm.layers.l3[0].id).to.be.equal("3_0");

            history.go(-2); // Too far!
            expect(pm).to.eql(defaultPM);
        });

        it.skip("deletes old snapshots automatically", function() {
            var history = new History(pm, { maxLength: 5 });
            pm.layers.l1[0].id = "1_0_1";
            history.snapshot();
            pm.layers.l1[0].id = "1_0_2";
            history.snapshot();
            pm.layers.l1[0].id = "1_0_3";
            history.snapshot();
            pm.layers.l1[0].id = "1_0_4";
            history.snapshot();
            pm.layers.l1[0].id = "1_0_5";
            history.snapshot();
            pm.layers.l1[0].id = "1_0_6";
            history.snapshot();
            pm.layers.l1[0].id = "1_0_7";
            history.snapshot();

            history.go(-5);
            expect(pm.layers).to.only.have.keys("l0", "l1", "l2");
            expect(pm.layers.l0).to.be.eql(defaultPM.layers.l0);
            expect(pm.layers.l1).to.have.length(1);
            expect(pm.layers.l1[0]).to.only.have.key("id");
            expect(pm.layers.l1[0].id).to.be.equal("1_0_3");
            expect(pm.layers.l2).to.be.eql(defaultPM.layers.l2);
            expect(history.try(-1)).to.be.equal(0);
        });

        it.skip("deletes branched snapshots automatically", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            history.snapshot();
            history.snapshot();
            history.snapshot();

            history.back();
            history.back();
            expect(history.length).to.be(4);

            history.snapshot();
            expect(pm).to.only.have.key("layers");
            expect(pm.layers).to.only.have.keys("l0", "l1", "l2");
            expect(history.length).to.be(3);
            expect(history.try(1)).to.be(0);
        });

    });

    describe("CLEAR", function() {

        it.skip("removes everything", function() {
            var history = new History(pm, { maxLength: 5 });
            history.snapshot();
            history.snapshot();
            history.snapshot();
            expect(history.length).to.be(3);

            history.clear();
            expect(history.length).to.be(0);
        });

    });

});
