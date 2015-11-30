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
        this.$data = {
            wprjFile: new WProjectFile(),
            layers: {},
            structures: []
        };
        this.$super(params);
    },

    mimetype: WProjectFile.MIMETYPE,
    fileExt: "wprj"
});

SerializableClass.$register(ProjectManager);

module.exports = ProjectManager;
