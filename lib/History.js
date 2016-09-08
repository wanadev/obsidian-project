"use strict";

var Class = require("abitbol");
var serializer = require("abitbol-serializable/lib/serializer");

/**
 * @class History
 * @constructor
 * @param {ProjectManager} pm
 * @param {Object} params
 * @param {Number} params.maxLength Max amount of snapshots.
 */
var History = Class.$extend({

    __init__: function(pm, params) {
        if (!pm) {
            throw new Error("History needs a project manager to bind to.");
        }

        // Initialisation
        params = params || {};
        this.$data.maxLength = params.maxLength || 0;

        this._pm = pm;
        this._snapshots = [];
        this._pointer = -1;
    },

    /**
     * Max amount of snapshots stored by the history.
     *
     * @property maxLength
     * @type {Number}
     */
    getMaxLength: function() {
        return this.$data.maxLength;
    },

    setMaxLength: function(maxLength) {
        this.$data.maxLength = maxLength;

        // Remove older snapshots if any
        if (this._snapshots.length > maxLength) {
            var backIndex = Math.max(this._pointer + 1, maxLength);
            var headIndex = backIndex - maxLength;
            this._snapshots.splice(backIndex, this._snapshots.length);
            this._snapshots.splice(0, headIndex);
            this._pointer -= headIndex;
        }
    },

    /**
     * Currently stored snapshots count.
     *
     * @property length
     * @readOnly
     * @type {Number}
     */
    getLength: function() {
        return this._snapshots.length;
    },

    /**
     * Take a snapshot of the current state of the project and put it into the history.
     * This snapshot will become the new head, all upbranch ones will be removed.
     *
     * @method snapshot
     */
    snapshot: function() {
        var snapshot = {};
        snapshot.layers = serializer.objectSerializer(this._pm.layers);
        this._snapshots.splice(0, this._pointer, snapshot);
        this._pointer = 0;

        if (this._snapshots.length > this.$data.maxLength) {
            this._snapshots.length = this.$data.maxLength;
        }
    },

    /**
     * Go backwards or forwards in history.
     * Positive delta is forwards, negative one is backwards.
     * This will change the current project to the saved version.
     *
     * @method go
     * @param {Number} delta
     */
    go: function(delta) {
        delta = this.try(delta);
        if (delta === 0) {
            return;
        }

        this._pointer -= delta;
        var snapshot = this._snapshots[this._pointer];

        // We create create these looking tables to be efficient in searching
        var structuresCache = this._getStructuresCache(this._pm);
        var snapshotStructuresCache = this._getStructuresCache(snapshot);

        // Remove all structures that should not exist
        for (var id in structuresCache) {
            if (!snapshotStructuresCache[id]) {
                this._pm.removeStructure(structuresCache[id]);
            }
        }

        // Add all structures that should exist
        for (id in snapshotStructuresCache) {
            if (!structuresCache[id]) {
                this._pm.addStructure(serializer.objectUnserializer(snapshotStructuresCache[id]));
            }
        }

        // Move structure to the layer they belong to and apply unserialized data
        for (var layerName in snapshot.layers) {
            var snapshotLayer = snapshot.layers[layerName];
            for (var i = 0; i < snapshotLayer.length; i++) {
                var snapshotStructure = snapshotLayer[i];
                var structure = structuresCache[snapshotStructure.id];
                var layer = structure.getLayer();

                // Change the layer if moved
                if (structure.$data._layerName !== layerName) {
                    layer.splice(layer.indexOf(structure), 1);
                    layer = this._pm.$data.layers[layerName];
                    layer.push(structure);
                    structure.$data._layerName = layerName;
                }

                // Apply structure data
                // TODO This apply should become a diff that will occur only on properties that are different
                structure.unserialize(snapshotStructure);
            }
        }

        // Final reordering
        // FIXME
    },

    /**
     * Go backwards in history.
     *
     * @method back
     */
    back: function() {
        return this.go(-1);
    },

    /**
     * Go forwards in history.
     *
     * @method forward
     */
    forward: function() {
        return this.go(1);
    },

    /**
     * Test the delta reachability with go.
     * Returns the effective delta that will occur.
     * Therefore, a return value of 0 means nothing will change.
     *
     * @method try
     * @param {Number} delta
     * @return {Number} Effective delta that will occur.
     */
    try: function(delta) {
        delta = (delta !== undefined) ? delta : -1;
        if (this._pointer < 0) {
            return 0;
        }

        if (delta > 0) {
            if (delta > this._pointer) {
                delta = this._pointer;
            }
        }
        else if (-delta > (this._snapshots.length - this._pointer - 1)) {
            delta = - (this._snapshots.length - this._pointer - 1);
        }

        return delta;
    },

    /**
     * Remove all snapshots from history.
     *
     * @method clear
     */
    clear: function() {
        this._snapshots.length = 0;
        this._pointer = -1;
    },

    /**
     * Construct structures cache.
     * This object associate all structures' id to the structure object.
     *
     * @method _getStructuresCache
     * @private
     * @param {ProjectManager} pm
     * @return {Object}
     */
    _getStructuresCache: function(pm) {
        var cache = {};
        for (var layerName in pm.layers) {
            var layer = pm.layers[layerName];
            for (var i = 0; i < layer.length; i++) {
                var structure = layer[i];
                cache[structure.id] = structure;
            }
        }

        return cache;
    }

});

module.exports = History;
