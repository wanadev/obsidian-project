"use strict";

var expect = require("expect.js");
var History = require("../lib/History.js");

describe("History", function() {

    it("can set level", function() {
        var history = new History();
        expect(history.level).to.equal(0);

        history.level = 5;
        expect(history.level).to.equal(5);

        var history2 = new History({ level: 7 });
        expect(history2.level).to.equal(7);
    });

    it.skip("can save snapshots", function() {
        var history = new History({ level: 5 });
        expect(history.snapshotsCount).to.equal(0);

        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });
        expect(history.snapshotsCount).to.equal(3);
    });

    it.skip("can undo snapshots", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });

        var snapshot = history.undoSnapshot();
        expect(snapshot).to.only.have.keys(["x", "y"]);
        expect(snapshot.x).to.equal(2);
        expect(snapshot.y).to.equal(2);

        snapshot = history.undoSnapshot();
        expect(snapshot).to.only.have.keys(["x", "z"]);
        expect(snapshot.x).to.equal(1);
        expect(snapshot.z).to.equal(1);
    });

    it.skip("can undo multiple snapshots at once", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });

        var snapshot = history.undoSnapshot(2);
        expect(snapshot).to.only.have.keys(["x", "z"]);
        expect(snapshot.x).to.equal(1);
        expect(snapshot.z).to.equal(1);
    });

    it.skip("can redo snapshots", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });
        history.undoSnapshot(2);

        var snapshot = history.redoSnapshot();
        expect(snapshot).to.only.have.keys(["x", "y"]);
        expect(snapshot.x).to.equal(2);
        expect(snapshot.y).to.equal(2);

        snapshot = history.redoSnapshot();
        expect(snapshot).to.only.have.keys(["x"]);
        expect(snapshot.x).to.equal(3);
    });

    it.skip("can redo multiple snapshots at once", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });
        history.undoSnapshot(2);

        var snapshot = history.redoSnapshot(2);
        expect(snapshot).to.only.have.keys(["x", "y"]);
        expect(snapshot.x).to.equal(2);
        expect(snapshot.y).to.equal(2);
    });

    it.skip("can get current snapshot", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });

        var snapshot = history.getSnapshot();
        expect(snapshot).to.only.have.key("x");
        expect(snapshot.x).to.equal(3);

        history.undoSnapshot();
        snapshot = history.getSnapshot();
        expect(snapshot).to.only.have.keys(["x", "y"]);
        expect(snapshot.x).to.equal(2);
        expect(snapshot.y).to.equal(2);

        history.redoSnapshot();
        snapshot = history.getSnapshot();
        expect(snapshot).to.only.have.key("x");
        expect(snapshot.x).to.equal(3);
    });

    it.skip("can clear all snapshots", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });

        history.clearSnapshots();
        var snapshot = history.getSnapshot();
        expect(snapshot).to.equal(null);
        expect(history.snapshotsCount).to.equal(0);
    });

    it.skip("deletes old snapshots automatically", function() {
        var history = new History({ level: 2 });
        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });

        var snapshot = history.undoSnapshot();
        expect(snapshot).to.only.have.keys(["x", "y"]);
        expect(snapshot.x).to.equal(2);
        expect(snapshot.y).to.equal(2);

        snapshot = history.undoSnapshot();
        expect(snapshot).to.equal(null);
    });

    it.skip("deletes branched snapshots automatically", function() {
        var history = new History({ level: 5 });
        history.saveSnapshot({ x: 1, z: 1 });
        history.saveSnapshot({ x: 2, y: 2 });
        history.saveSnapshot({ x: 3 });
        history.saveSnapshot({ x: 4, y: 4, z: 4 });
        history.saveSnapshot({ y: 5 });

        history.undoSnapshot(3);
        history.saveSnapshot({ y: 6, z: 6 });
        expect(history.snapshotsCount).to.equal(3);

        var snapshot = history.getSnapshot();
        expect(snapshot).to.only.have.keys(["y", "z"]);
        expect(snapshot.y).to.equal(6);
        expect(snapshot.z).to.equal(6);

        snapshot = history.redoSnapshot();
        expect(snapshot).to.equal(null);

        snapshot = history.undoSnapshot();
        expect(snapshot).to.only.have.keys(["x", "y"]);
        expect(snapshot.x).to.equal(2);
        expect(snapshot.y).to.equal(2);
    });

});
