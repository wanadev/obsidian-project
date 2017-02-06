---
title: Project Manager
autotoc: true
menuOrder: 100
---

# Project Manager

```javascript
ProjectManager = require("obsidian-project/lib/project-manager");
```

`ProjectManager` is a class that can manage a project. It can:

* Save a project as a Wanadev Project Format file (WPRJ),
* Load a save project from a WPRJ file,
* Projects can have metadata,
* Projects can have attached resources Blob (images, texts, video, 3D Models,...),
* History management (see [History](./history.html) class)
* Versioning (apply filters to old projects in order to update them)

Example:

```javascript
var ProjectManager = require("obsidian-project/lib/project-manager");

var project = new ProjectManager({
    fileExt: "wprj",      // Default extention for generated files (e.g. "kzd", "wnp",...)
    metadata: {
        // any metadata you want
    },
    wprjOptions: {
        type: "GENERIC"   // Project type (uppercase, 10 char max.)
    }
});
```


## Structures And Layers

A project is a list of layers, which are tables of serializable objects called [Structure](./structure).
Every dynamic data that the project has to store should be a [Structure](./structure).

### Adding a Structure To The Project

```javascript
var Structure = require("obsidian-project/lib/structure");

var structure = new Structure();
var layerName = "default";

project.addStructure(structure, layerName); // layerName is optional
```

A structure can be destroyed, and it will automatically be removed from the project:

```javascript
structure.destroy();
```

### Accessing The Structures

One can access any structure (layer independent):

```javascript
project.structures;               // -> {structureId: Structure, ...}
project.structures[structureId];  // -> Structure
```

Accessing to structures contained in a specific layer:

```javascript
project.layers;                 // -> {layerName: [Structure, ...], ...}
project.layers[layerName];      // -> [Structure, ...]
```


## Embedding Resources (Blob) To The Project

It is possible to attach blobs to the project:

```javascript
var blobId = project.addBlobFromUrl(url, options, callback);
// There are also different functions to add blobs from different sources
```

### Getting a Blob

Once a blob has been added, one can get retreive it:

```javascript
project.getBlobAsBuffer(blobId)
```


## Versioning

One can add a functions to convert project during opening. Example:

```javascript
// In this example, since version 1.5.0, MyStructure.name is renamed translatableName. And before 1.0.0, it didn't exist anyway.
project.addVersionFilter(">=1.0.0 <1.5.0", "1.5.0", function(sProject) {
    for (var i = 0; i < sProject.layers.myLayer.length; ++i) {
        var structure = sProject.layers.myLayer[i];
        if (structure.__name__ === "MyStructure") {
             structure.translatableName = structure.name;
             delete structure.name;
        }
    }
    return sProject;
});
```

__NOTE:__ For more information see [Project Manager Class API](./project-manager-api.html).
