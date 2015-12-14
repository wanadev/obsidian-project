"use strict";

var _ = require("lodash");

var serializers = {};

function addSerializer(name, functions) {
    serializers[name] = functions;
}

function objectSerializer(object) {
}

module.exports = {
    serializers: serializers,
    addSerializer: addSerializer,
    objectSerializer: objectSerializer
};
