"use strict";

var Class = require("abitbol");

/**
 * @class History
 * @constructor
 * @param {ProjectManager} projectManager
 * @param {Object} params
 * @param {Number} params.maxLength Max amount of snapshots.
 */
var History = Class.$extend({

    __init__: function(projectManager, params) {
        if (!projectManager) {
            throw new Error("History needs a project manager to bind to.");
        }

        // Initialisation
        params = params || {};
        this.$data.maxLength = params.maxLength || 0;
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
        throw new Error("Not implemented yet");
    },

    /**
     * Go backwards or forwards in history.
     * Positive delta is forwards, negative is backwards.
     * This will change the current project to the saved version.
     *
     * @method go
     * @param {Number} delta
     */
    go: function(delta) {
        delta = (delta !== undefined) ? delta : -1;
        throw new Error("Not implemented yet");
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
        throw new Error("Not implemented yet");
    },

    /**
     * Remove all snapshots from history.
     *
     * @method clear
     */
    clear: function() {
        throw new Error("Not implemented yet");
    }

});

module.exports = History;
