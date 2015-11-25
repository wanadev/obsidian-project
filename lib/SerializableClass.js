"use strict";

var Class = require("abitbol");
var uuid = require("uuid");

var _classes = {};

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
                if (data[prop] !== undefined) {
                    // TODO custom unserializer
                    this[prop] = data[prop];
                }
            }
        }
    },

    __classvars__: {
        "$unserialize": function(data) {
            if (!data.__name__ || !_classes[data.__name__]) {
                throw new Error("UnreferencedSerializableClass");
            }
            var sc = new _classes[data.__name__]();
            sc.unserialize(data);
            return sc;
        },

        "$register": function(sClass) {
            _classes[sClass.prototype.__name__] = sClass;
        }
    }
});

// Register the class
SerializableClass.$register(SerializableClass);

module.exports = SerializableClass;
