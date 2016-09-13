# WanadevProjectManager: Structure (`obsidian-project/lib/structure`)

`Structure` is a `SerializableClass` from which all projects structure should inherit.
Please read the documentation of `SerializableClass` (abitbol-serializable) and `ProjectManager` before using this class.

Example:

```javascript
var Structure = require("obsidian-project/lib/structure");

var Demo Structure.$extend({
    __name__: "Demo",

    // ... Your structure properties and method here

});

Structure.$register(Demo);
```


## Convenient Properties

```javascript
structure.project;   // -> ProjectManager: instance of the ProjectManager related to the structure
structure.layer;     // -> Array: array containing all the structures stored on the same layer that
                     //           the structure (= structure.project.layers["layerName"])
```
