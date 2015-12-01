"use strict";

// structure.project → ref to ProjectManager
// structure.layer   → ref to the layer
// structure.destroy() → structure.project.removeStructure(structure, true)

var SerializableClass = require("./SerializableClass.js");

var Structure = SerializableClass.$extend({
    __name__: "Structure",

    getProject: function() {
        return this.$data._project;
    },

    getLayer: function() {
        if (!this.project) {
            return [];
        }
        return this.project.getLayer(this.$data._layerName);
    },

    destroy: function() {
        if (this.project) {
            this.project.removeStructure(this);
        }
    }
});

SerializableClass.$register(Structure);

module.exports = Structure;
