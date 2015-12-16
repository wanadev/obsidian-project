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
```


## Loading A Project

```javascript
project.openFromBuffer(buffer);
project.openFromBlob(blob, callback);   // ASYNC // Promise, read 1. bellow
project.openFromData64Url(data64);
project.openFromUrl(url, callback);     // ASYNC // PROXY, read 2. bellow
```

### 1. project.openFromBlob(blob, callback)

Using a Node callback:

```javascript
project.openFromBlob(blob, function(error) {
    if (error) {
        console.error("Something went wrong...", error);
    } else {
        console.log("ok");
    }
});
```

Using promises:

```javascript
project.openFromBlob(blob)
    .then(function() {
        console.log("ok");
    })
    .catch(function(error) {
        console.error("Something went wrong...", error);
    });
```

### 2. project.openFromUrl(url)

__NOTE:__ This method require a server-side proxy to work, read `proxy.md` for more informations.

Using a Node callback:

```javascript
project.openFromUrl("http://example.com/project.wprj", function(error) {
    if (error) {
        console.error("Something went wrong...", error);
    } else {
        console.log("ok");
    }
});
```

Using promises:

```javascript
project.openFromUrl("http://example.com/project.wprj")
    .then(function() {
        console.log("ok");
    })
    .catch(function(error) {
        console.error("Something went wrong...", error);
    });
```



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
project.addBlob(blob, options, callback)         // ASYNC, read 1.
project.addBlobFromData64Url(data64, options)    // -> id: String
project.addBlobFromImage(image, options)         // -> id: String
project.addBlobFromUrl(url, options, callback)   // ASYNC // PROXY, read 2.
```

#### 1. project.addBlob(blob, options, callback)

Using a Node callback:

```javascript
project.addBlob(blob, {}, function(error, id) {
    if (error) {
        console.error("Something went wrong...", error);
    } else {
        console.log("ok, blobId = " + id);
    }
});
```

Using promises:

```javascript
project.addBlob(blob)
    .then(function(id) {
        console.log("ok, blobId = " + id);
    })
    .catch(function(error) {
        console.error("Something went wrong...", error);
    });
```

#### 2. project.addBlobFromUrl(url, options, callback)

__NOTE:__ This method require a server-side proxy to work, read `proxy.md` for more informations.

Using a Node callback:

```javascript
project.addBlobFromUrl("http://example.com/image.png", {}, function(error, id) {
    if (error) {
        console.error("Something went wrong...", error);
    } else {
        console.log("ok, blobId = " + id);
    }
});
```

Using promises:

```javascript
project.addBlobFromUrl("http://example.com/image.png")
    .then(function(id) {
        console.log("ok, blobId = " + id);
    })
    .catch(function(error) {
        console.error("Something went wrong...", error);
    });
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
project.getBlobAsImage(id, callback)   // ASYNC // Promise, read 1.
```

#### 1. project.getBlobAsImage(id, callback)

Using a Node callback:

```javascript
project.getBlobAsImage("blobId", function(error, image) {
    if (error) {
        console.error("Something went wrong...", error);
    } else {
        console.log("ok");
    }
});
```

Using promises:

```javascript
project.getBlobAsImage("blobId")
    .then(function(image) {
        console.log("ok");
    })
    .catch(function(error) {
        console.error("Something went wrong...", error);
    });
```


### Getting The List of All The Blobs Attached To The Project

```javascript
project.getBlobList();  // -> ["blobId1", "blobId2", ...]
```

