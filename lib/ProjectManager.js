"use strict";

    // project.mimetype          → "application/x-wanadev-project"
    // project.fileExt           → "wprj"
    // project.wprjOptions       → {type: "GENERIC", metadataFormat: 1, projectFormat: 1, blogIndexFormat: 1}
    //
    // project.metadata          → wprj metadata
//
// project.addLayer(layerName, layerName, ...)
// project.addLayer([layerName, layerName, ...])
// project.removeLayer(layerName, layerName, ...)
// project.removeLayer([layerName, layerName, ...])   // rm contained structures!
// project.layers            → {layerName: []}
// project.layers.layerName  → [Structure]
//
// project.structures        → {id: Structure}
// project.addStructure(structure, layerName)
// project.removeStrucutre(structure, _selfDestruct)
// project.removeStructure(structureId, _selfDestruct)
//
// project.saveToBuffer()    → Buffer
// project.saveToBlob()      → Blob
// project.saveToData64Url() → String
// project.saveToLocalFile(fileName)          // default: project.wprj
//
// project.openFromBuffer(project)
// project.openFromBlob(project)
// project.openFormData64Url(project)
// project.openFromLocalFile()
//
// TODO BLOBS
// TODO History

var SerializableClass = require("./SerializableClass.js");
var WProjectFile = require("wanadev-project-format");

var ProjectManager = SerializableClass.$extend({
    __name__: "Project",

    __init__: function(params) {
        this.$data.mimetype = WProjectFile.MIMETYPE;
        this.$data.fileExt = "wprj";
        this.$data.wprjFile = new WProjectFile();
        this.$data.wprjOptions = {
            metadataFormat: 1,
            projectFormat: 1,
            blobIndexFormat: 1
        };
        this.$data.layers = {};
        this.$data.structures = [];

        this.$super(params);
    },

    getMimetype: function() {
        "@serializable false";
        return this.$data.mimetype;
    },

    setMimetype: function(mimetype) {
        this.$data.mimetype = mimetype;
    },

    getFileExt: function() {
        "@serializable false";
        return this.$data.fileExt;
    },

    setFileExt: function(ext) {
        this.$data.fileExt = ext;
    },

    getWprjOptions: function() {
        "@serializable false";
        var options = {
            type: this.$data.wprjFile.type,
            metadataFormat: this.$data.wprjOptions.metadataFormat,
            projectFormat: this.$data.wprjOptions.projectFormat,
            blobIndexFormat: this.$data.wprjOptions.blobIndexFormat
        };
        // HACK: apply changes made to the object if the dev do something like `project.wprjOptions.type = "FOO"`...
        setTimeout(function() {
            this.setWprjOptions(options);
        }.bind(this), 0);
        return options;
    },

    setWprjOptions: function(options) {
        if (options.type) {
            this.$data.wprjFile.type = options.type;
        }
        for (var k in options) {
            if (this.$data.wprjOptions[k] !== undefined) {
                this.$data.wprjOptions[k] = options[k];
            }
        }
    },

    getMetadata: function() {
        "@serializable false";
        return this.$data.wprjFile.metadata;
    },

    setMetadata: function(metadata) {
        this.$data.wprjFile.metadata = metadata;
    }

});

SerializableClass.$register(ProjectManager);

module.exports = ProjectManager;
