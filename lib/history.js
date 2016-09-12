"use strict";

var Class = require("abitbol");
var lodash = require("lodash");
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

        // Add soft blob removal to project
        pm._removeBlobHook = this._onRemoveBlob;

        // Initialisation
        params = params || {};
        this.$data.maxLength = params.maxLength || 0;

        this._pm = pm;
        this._snapshots = [];
        this._pointer = -1;
        this._blobsCount = {};
    },

    /**
     * Destructor.
     */
    destroy: function() {
        this._pm._removeBlobHook = null;
    },

    /**
     * Max amount of snapshots stored by the history.
     *
     * @property maxLength
     * @readOnly
     * @type {Number}
     */
    getMaxLength: function() {
        return this.$data.maxLength;
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
        snapshot.blobCache = lodash.clone(this._pm.$data.blobCache);
        snapshot.blobList = lodash.clone(this._pm.$data.wprjFile.$data.blobs);
        this._snapshots.splice(0, this._pointer, snapshot);
        this._pointer = 0;

        for (var id in snapshot.blobCache) {
            this._blobsCount[id] = this._blobsCount[id] || 0;
            this._blobsCount[id] += 1;
        }

        this._cropLength();
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
        delta = this.simulate(delta);
        if (delta === 0) {
            return;
        }

        this._pointer -= delta;
        var snapshot = this._snapshots[this._pointer];

        // Reapplying blobs
        this._pm.$data.wprjFile.$data.blobs = lodash.clone(snapshot.blobList);
        this._pm.$data.blobCache = lodash.clone(snapshot.blobCache);

        // We create these looking tables to be efficient in searching
        var structuresCache = this._pm.$data.structures;
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

                // Change the layer if moved and reorder it anyway
                this._pm.setStructureLayer(snapshotStructure.id, layerName);
                this._pm.setStructureIndex(snapshotStructure.id, i);

                // Apply structure data for properties that have changed
                for (var propName in snapshotStructure) {
                    var snapshotProp = snapshotStructure[propName];
                    var prop = serializer.objectSerializer(structure[propName]);
                    if (!lodash.isEqual(snapshotProp, prop)) {
                        structure[propName] = serializer.objectUnserializer(snapshotProp);
                    }
                }

            }
        }
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
     * @method simulate
     * @param {Number} delta
     * @return {Number} Effective delta that will occur.
     */
    simulate: function(delta) {
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
    },

    /**
     * Crop the snapshots array to the max length.
     *
     * @method _cropLength
     * @private
     */
    _cropLength: function() {
        if (this._snapshots.length <= this.$data.maxLength) {
            return;
        }

        // Deallocate old blobs
        for (var i = this._snapshots.length - 1; i >= this.$data.maxLength; --i) {
            var snapshot = this._snapshots[i];
            for (var id in snapshot.blobCache) {
                this._blobsCount[id] -= 1;
                if (this._blobsCount[id] <= 0) {
                    this.$data.blobCache[id] = snapshot.blobCache[id];
                    this._pm._removeBlobHard(id);
                    delete this._blobsCount[id];
                }
            }
        }

        this._snapshots.length = this.$data.maxLength;
    },

    /**
     * Called whenever a blob is removed.
     * Returns whether the blob id can be completely deleted.
     *
     * @method _onRemoveBlob
     * @private
     * @return {Boolean}
     */
    _onRemoveBlob: function(id) {
        return !this._blobsCount[id];
    }

});

module.exports = History;
