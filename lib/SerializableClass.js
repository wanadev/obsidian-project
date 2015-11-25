"use strict";

var Class = require("abitbol");
var uuid = require("uuid");

/**
 * Serializable class
 *
 * @class
 * @mixes Class
 */
var SerializableClass = Class.$extend({
    __name__: "SerializableClass",

    /**
     * @constructs
     * @param {Object} params Optional params that will be applied to the class.
     */
    __init__: function(params) {
        this.unserialize(params, true);
    },

    getId: function() {
        if (!this.$data.id) {
            this.$data.id = uuid.v4();
        }
        return this.$data.id;
    },

    /**
     * Serialize the current instance.
     *
     * @param serialize
     */
    serialize: function() {
        var serialized = {
            __name__: this.__name__,
            id: this.id
        };
        for (var prop in this.$map.computedProperties) {
            if (this.$map.computedProperties[prop].get &&
                this.$map.computedProperties[prop].set &&
                this.$map.computedProperties[prop].annotations.serializable !== false
            ) {
                // TODO custom serializer
                serialized[prop] = this[prop];
            }
        }
        return serialized;
    },

    /**
     * Apply given data to the current instance.
     *
     * @param {object} data The data de unserialize.
     */
    unserialize: function(data, _unsafe) {
        if (!data) {
            return;
        }
        if (!_unsafe && data.__name__ !== this.__name__) {
            throw new Error("WrongClassUnserialization");
        }
        if (data.id) {
            this.$data.id = data.id;
        }
        for (var prop in this.$map.computedProperties) {
            if (this.$map.computedProperties[prop].get &&
                this.$map.computedProperties[prop].set &&
                (this.$map.computedProperties[prop].annotations.serializable !== false || _unsafe)
            ) {
                if (data[prop]) {
                    // TODO custom unserializer
                    this[prop] = data[prop];
                }
            }
        }
    }
});

module.exports = SerializableClass;
