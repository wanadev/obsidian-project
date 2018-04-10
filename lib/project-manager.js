"use strict";

// TODO DEFAULT METADATA {version: String, uuid: String, creationDate: Number, lastModification: Number}

var ObsidianProjectFile = require("obsidian-file");
var uuid = require("uuid");
var Q = require("q");
var SerializableClass = require("abitbol-serializable");
var serializer = require("abitbol-serializable/lib/serializer");
var httpRequest = require("obsidian-http-request");
var semver = require("semver");

var Structure = require("./structure.js");
var helpers = require("./helpers.js");

/**
 * @class obsidian-project.lib.project-manager
 * @extends abitbol-serializable
 */
var ProjectManager = SerializableClass.$extend({
    __name__: "Project",

    __init__: function(params) {
        this.$data.mimetype = ObsidianProjectFile.MIMETYPE;
        this.$data.fileExt = "wprj";
        this.$data.wprjOptions = {
            metadataFormat: 1,
            projectFormat: 1,
            blobIndexFormat: 1
        };
        this.$data.layers = {};
        this.$data.structures = {};
        this.$data.blobCache = {};   // {uuid: {blob: Blob, url: String}}
        this.$data.version = "0.0.0";

        this._filters = [];
        this._removeBlobHook = null;

        this.newEmptyProject();
        this.$super(params);
    },

    // ===== Public properties

    /**
     * The version of the project.
     *
     * @property version
     * @type String
     * @default "0.0.0"
     */
    getVersion: function() {
        "@serializable false";
        return this.$data.version;
    },

    setVersion: function(version) {
        this.$data.version = version;
    },

    /**
     * @property mimetype
     * @type String
     */
    getMimetype: function() {
        "@serializable false";
        return this.$data.mimetype;
    },

    setMimetype: function(mimetype) {
        this.$data.mimetype = mimetype;
    },

    /**
     * @property fileExt
     * @type String
     */
    getFileExt: function() {
        "@serializable false";
        return this.$data.fileExt;
    },

    setFileExt: function(ext) {
        this.$data.fileExt = ext;
    },

    /**
     * @property wprjOptions
     * @type Object
     */
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

    /**
     * @property metadata
     * @type Object
     */
    getMetadata: function() {
        "@serializable false";
        return this.$data.wprjFile.metadata;
    },

    setMetadata: function(metadata) {
        this.$data.wprjFile.metadata = metadata;
    },

    // ===== Layers

    /**
     * @property layers
     * @readOnly
     * @type obsidian-project.structure[]
     */
    getLayers: function() {
        return this.$data.layers;
    },

    /**
     * Add layers.
     *
     * @method addLayers
     */
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

    /**
     * Remove given layers and destroy all structures they contain.
     *
     * @method removeLayers
     */
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

    /**
     * Get a layer by name.
     *
     * @method getLayer
     * @param {String} layerName
     * @return {obsidian-project.structure[]} The requested layer or an empty Array if the layer does not exist.
     */
    getLayer: function(layerName) {
        return this.$data.layers[layerName] || [];
    },

    // ===== Structures

    /**
     * @property structures
     * @readOnly
     * @type Object
     */
    getStructures: function() {
        return this.$data.structures;
    },

    /**
     * Add a structure to the project.
     *
     * @method addStructure
     * @param {obsidian-project.structure} structure The structure to add.
     * @param {String} [layerName] The name of the layer (if undefined `"default"`).
     */
    addStructure: function(structure, layerName) {
        layerName = layerName || "default";
        var structureId;
        if (this.$data.structures[structure.id]) {
            this.removeStructure(structure);
        }
        structure.$data._project = this;
        structure.$data._layerName = layerName;
        this.$data.structures[structure.id] = structure;
        this.addLayers(layerName);
        this.$data.layers[layerName].push(structure);
    },

    /**
     * Remove a structure from the project.
     *
     * @method removeStructure
     * @param {obsidian-project.structure|String} structure The structure to remove or its ID.
     */
    removeStructure: function(structure) {
        structure = (structure instanceof Structure) ? structure : this.$data.structures[structure];
        structure.layer.splice(structure.layer.indexOf(structure), 1);
        delete this.$data.structures[structure.id];
        structure.$data._project = undefined;
        structure.$data._layerName = undefined;
    },

    /**
     * Change the structure's current layer.
     *
     * @method setStructureLayer
     * @param {obsidian-project.structure|String} structure
     * @param {String} layerName
     */
    setStructureLayer: function(structure, layerName) {
        structure = (typeof structure === "string") ? this.$data.structures[structure] : structure;
        if (!(structure instanceof Structure) || structure.$data._layerName === layerName) {
            return;
        }

        var layer = structure.layer;
        layer.splice(layer.indexOf(structure), 1);

        layerName = layerName || "default";
        this.addLayers(layerName);
        var targetLayer = this.$data.layers[layerName];
        targetLayer.push(structure);
        structure.$data._layerName = layerName;
    },

    /**
     * Change the structure's position within its layer relatively to its current position.
     *
     * @method moveStructure
     * @param {obsidian-project.structure|String} structure
     * @param {Number} delta
     */
    moveStructure: function(structure, delta) {
        structure = (typeof structure === "string") ? this.$data.structures[structure] : structure;
        if (!(structure instanceof Structure)) {
            return;
        }

        var index = structure.layer.indexOf(structure) + delta;
        this.setStructureIndex(structure, (index < 0) ? 0 : index);
    },

    /**
     * Change the structure's position within its layer to the specified index.
     *
     * @method setStructureIndex
     * @param {obsidian-project.structure|String} structure
     * @param {Number} index
     */
    setStructureIndex: function(structure, index) {
        structure = (typeof structure === "string") ? this.$data.structures[structure] : structure;
        if (!(structure instanceof Structure)) {
            return;
        }

        var layer = structure.layer;
        if (index < 0) {
            index = Math.max(layer.length + index, 0);
        }
        else {
            index = Math.min(index, layer.length - 1);
        }

        // Remove current and add to new
        layer.splice(layer.indexOf(structure), 1);
        layer.splice(index, 0, structure);
    },

    // ===== Save

    /**
     * Save a project as Node.js Buffer.
     *
     * @method saveAsBuffer
     * @return {Buffer}
     */
    saveAsBuffer: function() {
        this.$data.wprjFile.project = this.serialize();
        this.$data.wprjFile.metadata.version = this.$data.version;
        return this.$data.wprjFile.exportAsBlob(this.$data.wprjOptions);
    },

    /**
     * Save a project as data64 URL.
     *
     * @method saveAsData64Url
     * @return {String}
     */
    saveAsData64Url: function() {
        return "data:" + this.mimetype + ";base64," + this.saveAsBuffer().toString("base64");
    },

    /**
     * Save a project as Blob.
     *
     * @method saveAsBlob
     * @return {Blob}
     */
    saveAsBlob: function() {
        return helpers.createBlob([this.saveAsBuffer()], {type: this.mimetype});
    },

    // ===== Open

    /**
     * @method newEmptyProject
     * @param {Object} [metadata]
     */
    newEmptyProject: function(metadata) {
        var wprjFile = new ObsidianProjectFile();
        if (this.$data.wprjFile) {
            wprjFile.type = this.$data.wprjFile.type;
            wprjFile.metadata = {
                version: this.$data.version
            };
            this._clean();
        }
        if (metadata) {
            wprjFile.metadata = metadata;
        }
        this.$data.wprjFile = wprjFile;
    },

    /**
     * Open a project from a Node.js Buffer.
     *
     * @method openFromBuffer
     * @param {Buffer} buffer
     */
    openFromBuffer: function(buffer) {
        if (!ObsidianProjectFile.isObsidianProjectFile(buffer)) {
            throw new Error("UnvalidProject");
        }
        var wprjFile = new ObsidianProjectFile(buffer);
        this._applyVersionFilters(wprjFile);
        this._clean();
        this.$data.wprjFile = wprjFile;
        this.unserialize(wprjFile.project);
    },

    /**
     * Open a project from a data64 URL.
     *
     * @method openFromData64Url
     * @param {String} data64
     */
    openFromData64Url: function(data64) {
        if (data64.split(":")[0] !== "data") {
            throw new Error("UnvalidProject");
        }
        var buffer = Buffer.from(data64.split(",")[1], "base64");
        this.openFromBuffer(buffer);
    },

    /**
     * [ASYNC] Open a project from a Blob.
     *
     * @method openFromBlob
     * @param {Blob} blob
     */
    openFromBlob: function(blob, callback) {
        var this_ = this;
        return Q.Promise(function(resolve, reject) {
            if (!(blob instanceof Blob)) {
                throw new Error("NotABlob");
            }
            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var buffer = Buffer.from(event.target.result);
                    this_.openFromBuffer(buffer);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        }).nodeify(callback);
    },

    /**
     * [ASYNC] [PROXY] Open a project from an URL (HTTP request).
     *
     * @method openFromUrl
     * @param {String} url
     */
    openFromUrl: function(url, callback) {
        var this_ = this;
        return httpRequest.getRawProxy(url)
            .then(function(response) {
                this_.openFromBuffer(response);
            })
            .nodeify(callback);
    },

    // ===== Blobs

    /**
     * [ASYNC] Add a blob to the project from a Blob/File.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @method addBlob
     * @param {Buffer} blob The blob.
     * @param {Object} [options] Additional informations.
     * @param {Function} callback
     * @return {String} The blob id.
     */
    addBlob: function(blob, options, callback) {
        var this_ = this;
        options = options || {};
        return Q.Promise(function(resolve, reject) {
            if (!(blob instanceof Blob)) {
                throw new Error("NotABlob");
            }
            options.mime = options.mime || blob.type;
            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var buffer = Buffer.from(event.target.result);
                    var id = this_.addBlobFromBuffer(buffer, options);
                    this_.$data.blobCache[id] = {blob: blob, url: null};
                    resolve(id);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        }).nodeify(callback);
    },

    /**
     * Add a blob to the project from a Node.js Buffer.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @method addBlobFromBuffer
     * @param {Buffer} buffer The blob.
     * @param {Object} [options] Additional informations.
     * @return {String} The blob id.
     */
    addBlobFromBuffer: function(buffer, options) {
        options = options || {};
        var id = options.id || uuid.v4();
        if (this.blobExists(id)) {
            this.removeBlob(id);
        }
        this.$data.wprjFile.addBlob(buffer, id, options);
        return id;
    },

    /**
     * Add a blob to the project from a data64 URL.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @method addBlobFromData64Url
     * @param {String} data64 The blob.
     * @param {Object} [options] Additional informations.
     * @return {String} The blob id.
     */
    addBlobFromData64Url: function(data64, options) {
        options = options || {};
        var id = options.id || uuid.v4();
        if (this.blobExists(id)) {
            this.removeBlob(id);
        }
        this.$data.wprjFile.addBlobFromData64Url(data64, id, options);
        return id;
    },

    /**
     * Add a blob to the project from an Image.
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * WARNING: be careful of the CORS!
     * Requesting an external image will just fail.
     *
     * @method addBlobFromImage
     * @param {Image} image The blob.
     * @param {Object} [options] Additional informations.
     * @return {String} The blob id.
     */
    addBlobFromImage: function(image, options) {
        options = options || {};
        var mimetype = (options.mime == "image/jpeg") ? "image/jpeg" : "image/png";
        delete options.mime;

        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);

        return this.addBlobFromData64Url(canvas.toDataURL(mimetype, options.imageQuality));
    },

    /**
     * [ASYNC] [PROXY] Add a blob to the project from an URL
     *
     * options:
     *
     *     {
     *         mime: "application/octet-stream",
     *         metadata: {}
     *     }
     *
     * @method addBlobFromUrl
     * @param {String} url The blob's URL.
     * @param {Object} [options] Additional informations.
     * @param {Function} callback
     * @return {String} The blob id.
     */
    addBlobFromUrl: function(url, options, callback) {
        options = options || {};
        var this_ = this;
        return httpRequest._operations._requestProxy(url)
            .then(httpRequest._operations._checkHeaders)
            .then(httpRequest._operations._readBody)
            .then(function(response) {
                if (!options.mime && response.headers["content-type"]) {
                    options.mime = response.headers["content-type"].split(";")[0].toLowerCase();
                }
                return this_.addBlobFromBuffer(response.body, options);
            })
            .nodeify(callback);
    },

    /**
     * Get a blob as a Node.js Buffer.
     *
     * @method getBlobAsBuffer
     * @param {String} id The id of the blob.
     * @return {Buffer} the blob.
     */
    getBlobAsBuffer: function(id) {
        return this.$data.wprjFile.getBlob(id);
    },

    /**
     * Get a blob as a Blob.
     *
     * @method getBlob
     * @param {String} id The id of the blob.
     * @return {Blob} the blob.
     */
    getBlob: function(id) {
        if (this.$data.blobCache[id] && this.$data.blobCache[id].blob) {
            return this.$data.blobCache[id].blob;
        }
        var buffer = this.getBlobAsBuffer(id);
        if (!buffer) {
            return null;
        }
        var mime = this.$data.wprjFile.getBlobRecord(id).mime;
        var blob = helpers.createBlob([buffer], {type: mime});
        this.$data.blobCache[id] = {blob: blob, url: null};
        return blob;
    },

    /**
     * Get a blob as a data64 URL.
     *
     * @method getBlobAsBuffer
     * @param {String} id The id of the blob.
     * @return {String} the blob.
     */
    getBlobAsData64Url: function(id) {
        return this.$data.wprjFile.getBlobAsData64Url(id);
    },

    /**
     * Get a blob as a Blob URL.
     *
     * @method getBlobAsUrl
     * @param {String} id The id of the blob.
     * @return {String} the blob URL.
     */
    getBlobAsUrl: function(id) {
        if (this.$data.blobCache[id] && this.$data.blobCache[id].url) {
            return this.$data.blobCache[id].url;
        }
        var blob = this.getBlob(id);
        var url = (global.URL || global.webkitURL).createObjectURL(blob);
        this.$data.blobCache[id].url = url;
        return url;
    },

    /**
     * [ASYNC] Get a blob as an Image
     *
     * @method getBlobAsImage
     * @param {String} id The id of the blob
     * @param {Function} callback
     * @return {Image} the blob
     */
    getBlobAsImage: function(id, callback) {
        var this_ = this;
        return Q.Promise(function(resolve, reject) {
            var blob = this_.getBlob(id);
            if (!blob) {
                throw new Error("BlobDoesNotExist");
            }
            if (blob.type.indexOf("image/") !== 0) {
                throw new Error("NotAnImageBlob");
            }
            var url = this_.getBlobAsUrl(id);
            var image = new Image();
            image.onload = function(event) {
                resolve(image);
            };
            image.onerror = reject;
            image.src = url;
        }).nodeify(callback);
    },

    /**
     * Get metadata of a blob.
     *
     * @method getBlobMetadata
     * @param {String} id The blob's id.
     */
    getBlobMetadata: function(id) {
        return this.$data.wprjFile.getBlobRecord(id).metadata;
    },

    /**
     * Remove a blob.
     *
     * @method removeBlob
     * @param {String} id The id of the blob to remove.
     */
    removeBlob: function(id) {
        this.$data.wprjFile.removeBlob(id);

        if (this.$data.blobCache[id]) {
            if (!this._removeBlobHook || this._removeBlobHook(id)) {
                this._removeBlobHard(id);
            } else {
                delete this.$data.blobCache[id];
            }
        }
    },

    /**
     * Remove a blob and its data if any.
     *
     * @method _removeBlobHard
     * @private
     * @param {String} id The id of the blob to remove.
     */
    _removeBlobHard: function(id) {
        // Free blobs and blobs' URL
        if (this.$data.blobCache[id].url) {
            (global.URL || global.webkitURL).revokeObjectURL(this.$data.blobCache[id].url);
        }
        if (this.$data.blobCache[id].blob && this.$data.blobCache[id].blob.close) {
            try {
                this.$data.blobCache[id].blob.close();
            } catch (error) {
                // pass
            }
        }
        delete this.$data.blobCache[id];
    },

    /**
     * Get an array of all blobs.
     *
     * @method getBlobList
     * @return {Blob[]}
     */
    getBlobList: function() {
        return this.$data.wprjFile.getBlobList();
    },

    /**
     * Check whether a blob exists or not.
     *
     * @method blobExists
     * @param {String} id
     * @return {Boolean}
     */
    blobExists: function(id) {
        return this.$data.wprjFile.blobExists(id);
    },

    // ===== Version

    /**
     * Add a new filter to convert from a previous version.
     *
     * @method addVersionFilter
     * @param {String} sourceSemver
     * @param {String} targetVersion
     * @param {Function} convert
     */
    addVersionFilter: function(sourceSemver, targetVersion, convert) {
        this._filters.push({
            sourceSemver: sourceSemver,
            targetVersion: targetVersion,
            convert: convert
        });
    },

    /**
     * Sequentially apply all filters until hitting the current version.
     *
     * @method _applyVersionFilters
     * @private
     * @param  {obsidian-file} wprjFile
     */
    _applyVersionFilters: function(wprjFile) {
        if (!wprjFile.metadata.version) {
            return;
        }

        var converted = true;
        while (converted) {
            converted = false;
            for (var i = 0; i < this._filters.length; ++i) {
                var filter = this._filters[i];
                if (semver.lt(wprjFile.metadata.version, filter.targetVersion) && semver.satisfies(wprjFile.metadata.version, filter.sourceSemver)) {
                    converted = true;
                    wprjFile.project = filter.convert(wprjFile.project);
                    wprjFile.metadata.version = filter.targetVersion;
                }
            }
        }
    },

    // ===== Serialization

    /**
     * Handles unserialization errors (like missing serializers,...)
     *
     * By default it only rethrows the unserialization error, but it can
     * be overriden to handle gracefully the error.
     *
     * This method can be used to return a "repaired" structure to insert
     * in the project
     *
     * @method unserializationErrorHandler
     * @param {String} layer
     * @param {Object} data
     * @param {Error} error
     * @return {undefined|Structure}
     */
    unserializationErrorHandler: function(layer, data, error) {
        throw error;
    },

    serialize: function() {
        var serialized = this.$super();
        serialized.layers = serializer.objectSerializer(this.layers);
        return serialized;
    },

    unserialize: function(serialized) {
        this.$super(serialized);

        var structure;
        for (var layerName in serialized.layers) {
            for (var i = 0 ; i < serialized.layers[layerName].length ; i++) {
                try {
                    this.addStructure(this.$class.$unserialize(serialized.layers[layerName][i]), layerName);
                } catch (error) {
                    structure = this.unserializationErrorHandler(layerName, serialized.layers[layerName][i], error);
                    if (structure !== undefined) {
                        this.addStructure(structure, layerName);
                    }
                }
            }
        }
    },

    /**
     * Remove all structures and blobs.
     *
     * @method _clean
     * @private
     */
    _clean: function() {
        var structures = Object.getOwnPropertyNames(this.$data.structures);
        for (var i = structures.length - 1; i >= 0; --i) {
            if (this.$data.structures[structures[i]]) {
                this.$data.structures[structures[i]].destroy();
            }
        }
        this.$data.structures = {};
        this.$data.layers = {};
        var blobList = this.getBlobList();
        for (i = blobList.length - 1; i >= 0; --i) {
            this.removeBlob(blobList[i]);
        }
    }

});

SerializableClass.$register(ProjectManager);

module.exports = ProjectManager;
