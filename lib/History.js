"use strict";

var Class = require("abitbol");

/**
 * @class History
 * @constructor
 * @param {Object} params
 * @param {Number} params.level Max amount of snapshots.
 */
var History = Class.$extend({

    __init__: function(params) {
        // Initialisation
        params = params || {};
        this.$data.level = params.level || 0;
        this.$data.snapshotsCount = 0;
    },

    /**
     * Max amount of snapshots stored by the history.
     *
     * @property level
     * @type {Number}
     */
    getLevel: function() {
        return this.$data.level;
    },

    setLevel: function(level) {
        this.$data.level = level;
    },

    /**
     * Currently stored snapshots count.
     *
     * @property snapshotsCount
     * @type {Number}
     */
    getSnapshotsCount: function() {
        return this.$data.snapshotCount;
    },

    setSnapshotsCount: function(snapshotCount) {
        this.$data.snapshotCount = snapshotCount;
    },

    /**
     * Currently selected snapshot.
     *
     * @method getSnapshot
     * @return {Object|null} The current snapshot.
     */
    getSnapshot: function() {
        throw new Error("Not implemented yet");
    },

    /**
     * Save the provided snapshot into the history.
     *
     * @method saveSnapshot
     * @param {Object} snapshot
     */
    saveSnapshot: function(snapshot) {
        throw new Error("Not implemented yet");
    },

    /**
     * Go backwards in history.
     *
     * @method undoSnapshot
     * @param {Number} amount How many snapshots to undo.
     * @return {Object|null} The new current snapshot.
     */
    undoSnapshot: function(amount) {
        amount = amount || 1;
        throw new Error("Not implemented yet");
    },

    /**
     * Go forwards in history.
     *
     * @method redoSnapshot
     * @param {Number} amount How many snapshots to redo.
     * @return {Object|null} The new current snapshot.
     */
    redoSnapshot: function(amount) {
        amount = amount || 1;
        throw new Error("Not implemented yet");
    },

    /**
     * Remove all snapshots from history.
     *
     * @method clearSnapshots
     */
    clearSnapshots: function() {
        throw new Error("Not implemented yet");
    }

});

module.exports = History;
