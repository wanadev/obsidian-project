"use strict";

var SerializableClass = require("abitbol-serializable");

/**
 * A structure that can be added to a ProjectManager.
 *
 * @class obsidian-project.lib.structure
 * @extends abitbol-serializable
 */
var Structure = SerializableClass.$extend({
    __name__: "Structure",

    /**
     * @property project
     * @readOnly
     * @type obsidian-project.lib.project-manager
     */
    getProject: function() {
        return this.$data._project;
    },

    /**
     * @property layer
     * @readOnly
     * @type obsidian-project.lib.structure[]
     */
    getLayer: function() {
        if (!this.project) {
            return [];
        }
        return this.project.getLayer(this.$data._layerName);
    },

    /**
     * @method destroy
     */
    destroy: function() {
        if (this.$data._project) {
            this.$data._project.removeStructure(this);
        }
    }
});

SerializableClass.$register(Structure);

module.exports = Structure;
