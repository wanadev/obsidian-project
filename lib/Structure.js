"use strict";

// structure.project → ref to ProjectManager
// structure.destroy() → structure.project.removeStructure(structure, true)

var SerializableClass = require("./SerializableClass.js");

var Structure = SerializableClass.$extend({
    __name__: "Structure"
});

SerializableClass.$register(Structure);

module.exports = Structure;
