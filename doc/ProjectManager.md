# WanadevProjectManager: ProjecTManager

`SerializedManager` is an class that can manage a project. Features:

* Save a project as a Wanadev Project Format file (WPRJ),
* Load a save project from a WPRJ file,
* Projects can have metadata,
* Projects can have attached resources Blob (images, texts, video, 3D Models,...),
* TODO ~~Can handle canvas as resource (with history management)~~
* TODO ~~History management (undo/redo)~~
* TODO ~~Versionning (apply filters to old projects versions to update them)~~
* TODO ~~Local save (to allow data recovery on browser crash)~~

Example:

```javascript
var ProjectManager = require("wanadev-project-manager/lib/ProjectManager");

var project = new ProjectManager({
    fileExt: "wprj",      // Default extention for generated files (e.g. "kzd", "wnp", "xbly")
    metadata: {
        // any metadata you want
    },
    wprjOptions: {
        type: "GENERIC"   // Project type (uppercase, 10 char max. e.g.: "KAZADECOR", "WANAPLAN", "XBLY")
    }
});
```


## New Empty Project

```javascript
var metadata = {};
project.newEmptyProject(metadata);  // the metadata are optional
```

__NOTE:__ When you instantiate the `ProjectManager` class, it already contains an empty project.


## Save A Project

```javascript
project.saveAsBuffer();     // -> Buffer
project.saveAsBlob();       // -> Blob
project.saveAsData64Url();  // -> String
project.saveToLocalFile(fileName);  // NOT IMPLEMENTED YET // filename is optional, "project.wprj" by default
```


## Loading A Project

```javascript
project.openFromBuffer(buffer);
project.openFromBlob(blob, callback);   // ASYNC, read 1. bellow
project.openFromData64Url(data64);
project.openFromLocalFile();            // NOT IMPLEMENTED YET // read 2. bellow
project.openFromUrl(url, callback);     // NOT IMPLEMENTED YET // ASYNC, read 3. bellow
```

### 1. project.openFromBlob(blob, callback)

Callback:

```javascript
function(error) {
    // `error` is undefined if every thing is ok, else it contains the error.
}
```

### 2. project.openFromLocalFile()

TODO

### 3. project.openFromUrl(url)

TODO


## Structures And Layers

### Adding a Structure To The Project

```javascript
var Structure = require("wanadev-project-manager/lib/Structure");

var structure = new Structure();
var layerName = "default";

project.addStructure(structure, layerName);
```

* `structure` is an instance of a class inherited from `Structure` (that is itself inherited from `SerializableCalss`).
* `layerName` is the name of the layer on which the structure will be added.
  * This parameter is **optional**. If it is not provided, the structure will be added to a layer called `"default"`.
  * If the given `layerName` does not match an existing layer, a new layer will be automatically created.

### Removing a Structure From The Project

```javascript
project.removeStructure(structure);    // Instance of Structure
project.removeStructure(structureId);  // Structure id as String
```

__NOTE:__ This will only detach the structure from the project, this
**will not** destroy it (it does not call the `structure.destroy()` method.
If you want to destroy the structure, just call the `structure.destroy()`
method, this will automatically detach the structure from the parent project.

### Accessing To The Structures

Accessing to structures (layer independent):

```javascript
project.structures;               // -> {structureId: Structure, ...}
project.structures[structureId];  // -> Structure
```

Accessing to structures contained in a specific layer:

```javascript
project.layers;                 // -> {layerName: [Structure, ...], ...}
project.layers[layerName];      // -> [Structure, ...]
```

### Adding Layers

Layers are automatically added when you add a structure to an unexisting layer, but you can also add them manually:

```javascript
project.addLayers("layer1");
project.addLayers("layer1", "layer2", ...);
project.addLayers(["layer1", "layer2", ...]);
```

### Removing Layers

```javascript
project.removeLayers("layer1");
project.removeLayers("layer1", "layer2", ...);
project.removeLayers(["layer1", "layer2", ...]);
```

__NOTE:__ This will remove and **destroy** (`structure.destroy()`) all the structures contained in the layer!


## Attaching Resources (Blob) To The Project

### Adding Blobs

```javascript
project.addBlobFromBuffer(buffer, options)       // -> id: String
project.addBlob(blob, callback, options)         // ASYNC -> callback: function(error, id) {}
project.addBlobFromData64Url(data64, options)    // -> id: String
project.addBlobFromImage(image, options)         // -> id: String
project.addBlobFromUrl(url, callback, options)   // NOT IMPLEMENTED YET // ASYNC, SERVER PROXY, -> callback: function(error, id) {}
```

### Removing a Blob

```javascript
project.removeBlob(id);
```

### Getting a Blob

```javascript
project.getBlobAsBuffer(id)            // -> Buffer
project.getBlob(id)                    // -> Blob
project.getBlobAsData64Url(id)         // -> String
project.getBlobUrl(id)                 // -> String
project.getBlobAsImage(id, callback)   // ASYNC -> function(error, image) {}
```

### Getting The List of All The Blobs Attached To The Project

```javascript
project.getBlobList();  // -> ["blobId1", "blobId2", ...]
```

