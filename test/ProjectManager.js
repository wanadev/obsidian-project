"use strict";

var expect = require("expect.js");
var ProjectManager = require("../lib/ProjectManager.js");

describe("ProjectManager", function() {

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
