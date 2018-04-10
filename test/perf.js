"use strict";

var NB_STRUCTURES = 1000;
var NB_BLOBS = 10;
var BLOB_SIZE = 1024 * 512;  // 512 kiB

var Structure = require("../lib/structure.js");
var ProjectManager = require("../lib/project-manager.js");

var TestStructure = Structure.$extend({
    getProp1: function() { return "abcdefghijklmnopqrstuvwxyz"; },
    setProp1: function() {},

    getProp2: function() { return 1234567890; },
    setProp2: function() {},

    getProp3: function() { return false; },
    setProp3: function() {},

    getProp4: function() { return true; },
    setProp4: function() {},

    getProp5: function() { return null; },
    setProp5: function() {},

    getProp6: function() { return {key1: "value1", key2: ["v1", 2, false], key3: {x: 1, y:2, z: 3, a: {}}, key4: [{}, {}]}; },
    setProp6: function() {},

    getProp7: function() { return ["aaaa", "bbbb", "cccc", "ddddd", "eeee"]; },
    setProp7: function() {},
});

function addPerfTestButton() {
    var btn = document.createElement("button");
    btn.style.position = "absolute";
    btn.style.top = "5px";
    btn.style.left = "5px";
    btn.innerHTML = "Run Perf Test";
    btn.onclick = runPerfTest;
    document.body.appendChild(btn);
}

function runPerfTest() {
    console.log("==== RUNNING PERF TEST ====");
    var project = new ProjectManager({
        wprjOptions: {
            type: "PERFTEST"
        }
    });

    for (var i = 0 ; i < NB_STRUCTURES ; i++) {
        project.addStructure(new TestStructure());
    }

    for (i = 0 ; i < NB_BLOBS ; i++) {
        project.addBlobFromBuffer(Buffer.alloc(BLOB_SIZE));
    }

    console.time("serialization");
    var serilized = project.serialize();
    console.timeEnd("serialization");

    console.time("project-save");
    var wprjFile = project.saveAsBuffer();
    console.timeEnd("project-save");

    console.log("WPRJ File Size: " + (wprjFile.length / 1024 | 0) + " kiB");
    console.log("Project JSON size (uncompressed): " + (JSON.stringify(serilized).length / 1024 | 0) + " kiB");
    console.log("Project JSON size (compressed): " + (wprjFile.readUInt32BE(30) / 1024 | 0) + " kiB");
}

addPerfTestButton();
