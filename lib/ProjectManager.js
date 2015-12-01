"use strict";

    // project.mimetype          → "application/x-wanadev-project"
    // project.fileExt           → "wprj"
    // project.wprjOptions       → {type: "GENERIC", metadataFormat: 1, projectFormat: 1, blogIndexFormat: 1}
    //
    // project.metadata          → wprj metadata
    //
    // project.newEmptyProject(metadata)
//
// project.addLayer(layerName, layerName, ...)
// project.addLayer([layerName, layerName, ...])
// project.removeLayer(layerName, layerName, ...)
// project.removeLayer([layerName, layerName, ...])   // rm contained structures!
// project.getLayer(name)    → [Structure]
// project.layers            → {layerName: []}
// project.layers.layerName  → [Structure]
//
// project.structures        → {id: Structure}
// project.addStructure(structure, layerName)   // Create layer if not exists
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
// TODO DEFAULT METADATA {version: String, uuid: String, creationDate: Number, lastModification: Number}
// TODO BLOBS
// TODO History
// TODO Versioning
// TODO Local Save (localStorage + IndexedDB)

var SerializableClass = require("./SerializableClass.js");
var WProjectFile = require("wanadev-project-format");

var ProjectManager = SerializableClass.$extend({
    __name__: "Project",

    __init__: function(params) {
        this.$data.mimetype = WProjectFile.MIMETYPE;
        this.$data.fileExt = "wprj";
        this.$data.wprjOptions = {
            metadataFormat: 1,
            projectFormat: 1,
            blobIndexFormat: 1
        };
        this.$data.layers = {};
        this.$data.structures = {};

        this.newEmptyProject();
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
    },

    newEmptyProject: function(metadata) {
        var wprjFile = new WProjectFile();
        if (this.$data.wprjFile) {
            wprjFile.type = this.$data.wprjFile.type;
            this._clean();
        }
        if (metadata) {
            wprjFile.metadata = metadata;
        }
        this.$data.wprjFile = wprjFile;
    },

    getLayers: function() {
        return this.$data.layers;
    },

    addLayers: function(/* *args */) {
        function _add(project, layerName) {
            project.$data.layers[layerName] = project.$data.layers[layerName] || [];
        }
        for (var i = 0 ; i < arguments.length ; i++) {
            if (Array.isArray(arguments[i])) {
                for (var j = 0 ; j < arguments[i].length ; j++) {
                    _add(this, arguments[i][j]);
                }
            } else {
                _add(this, arguments[i]);
            }
        }
    },

    removeLayers: function(/* *args */) {
        function _remove(project, layerName) {
            if (project.$data.layers[layerName]) {
                for (var i = 0 ; i < project.$data.layers[layerName].length ; i++) {
                    project.$data.layers[layerName][i].destroy();
                }
                delete project.$data.layers[layerName];
            }
        }
        for (var i = 0 ; i < arguments.length ; i++) {
            if (Array.isArray(arguments[i])) {
                for (var j = 0 ; j < arguments[i].length ; j++) {
                    _remove(this, arguments[i][j]);
                }
            } else {
                _remove(this, arguments[i]);
            }
        }
    },

    getLayer: function(layerName) {
        return this.$data.layers[layerName] || [];
    },

    _clean: function() {
        var structures = Object.getOwnPropertyNames(this.$data.structures);
        for (var i = 0 ; i < structures.length ; i++) {
            this.$data.structures[structures[i]].destroy();
        }
        this.$data.structures = {};
        this.$data.layers = [];
    }

});

SerializableClass.$register(ProjectManager);

module.exports = ProjectManager;
