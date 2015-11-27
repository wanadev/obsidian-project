"use strict";

var Class = require("abitbol");
var uuid = require("uuid");

var _classes = {};
var _serializers = {};

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
        this.apply(params);
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
                if (this.$map.computedProperties[prop].annotations.serializer) {
                    serialized[prop] = _serializers[this.$map.computedProperties[prop].annotations.serializer].serialize(this[prop]);
                } else {
                    serialized[prop] = this[prop];
                }
            }
        }
        return serialized;
    },

    /**
     * Deserialize given data into the current instance.
     *
     * @param {object} data The data to unserialize.
     */
    unserialize: function(data) {
        if (!data) {
            return;
        }
        if (data.__name__ !== this.__name__) {
            throw new TypeError("WrongClassUnserialization");
        }
        if (data.id) {
            this.$data.id = data.id;
        }
        for (var prop in this.$map.computedProperties) {
            if (this.$map.computedProperties[prop].get &&
                this.$map.computedProperties[prop].set &&
                (this.$map.computedProperties[prop].annotations.serializable !== false)
            ) {
                if (data[prop] === undefined) {
                    continue;
                }
                if (this.$map.computedProperties[prop].annotations.serializer) {
                    this[prop] = _serializers[this.$map.computedProperties[prop].annotations.serializer].unserialize(data[prop]);
                } else {
                    this[prop] = data[prop];
                }
            }
        }
    },

    /**
     * Apply given data to the current instance.
     *
     * @param {object} data The data to apply.
     */
    apply: function(data) {
        if (!data) {
            return;
        }
        if (data.id) {
            this.$data.id = data.id;
        }
        for (var prop in this.$map.computedProperties) {
            if (this.$map.computedProperties[prop].get && this.$map.computedProperties[prop].set) {
                if (data[prop] !== undefined) {
                    this[prop] = data[prop];
                }
            }
        }
    },

    /**
     * Clone this instance (only serializable properties are cloned).
     */
    clone: function() {
        var data = this.serialize();
        delete data.id;  // Do not clone the id!
        return this.$class.$unserialize(data);
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
        },

        $addSerializer: function(name, functions) {
            if (typeof functions.serialize !== "function" || typeof functions.unserialize !== "function") {
                throw new TypeError("NotAFunction");
            }
            _serializers[name] = functions;
        }
    }
});

// Register the class
SerializableClass.$register(SerializableClass);

// Add a serializer for SerializableClass
SerializableClass.$addSerializer("serializableClass", {
    serialize: function(sclass) {
        return sclass.serialize();
    },
    unserialize: function(data) {
        return SerializableClass.$unserialize(data);
    }
});

module.exports = SerializableClass;
