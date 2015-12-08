# WanadevProjectManager: Structure

`Structure` is a `SerializableClass` from which all projects structure should inherit.
Please read the documentation of `SerializableClass` and `ProjectManager` before using this class.

Example:

```javascript
var Structure = require("wanadev-project-manager/lib/Structure");

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
