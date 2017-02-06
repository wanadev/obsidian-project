---
title: Project Manager Class API
autotoc: true
menuOrder: 1000
---

# Project Manager Class API

```javascript
ProjectManager = require("obsidian-project/lib/project-manager");
var project = new ProjectManager();
```

## Project Management

### project.newEmptyProject(metadata)

Create a new project. The metadata are optional.

__NOTE:__ When you instantiate the `ProjectManager` class, it already contains an empty project.


### project.saveAs&lt;TYPE&gt;()

```javascript
project.saveAsBuffer();     // -> Buffer
project.saveAsBlob();       // -> Blob
project.saveAsData64Url();  // -> String
```


### project.openFrom&lt;TYPE&gt;(...)

```javascript
project.openFromBuffer(buffer);
project.openFromBlob(blob, callback);   // ASYNC // Promise, read 1. below
project.openFromData64Url(data64);
project.openFromUrl(url, callback);     // ASYNC // PROXY, read 2. below
```

#### 1. project.openFromBlob(blob, callback)

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

#### 2. project.openFromUrl(url)

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

### project.addStructure(structure, layerName)

* `structure` is an instance of a class inherited from `Structure` (that is itself inherited from `SerializableCalss`).
* `layerName` is the name of the layer on which the structure will be added.
  * This parameter is **optional**. If it is not provided, the structure will be added to a layer called `"default"`.
  * If the given `layerName` does not match an existing layer, a new layer will be automatically created.

### project.removeStructure(...)

```javascript
project.removeStructure(structure);    // Instance of Structure
project.removeStructure(structureId);  // Structure id as String
```

__NOTE:__ This will only detach the structure from the project, this
**will not** destroy it (it does not call the `structure.destroy()` method.
If you want to destroy the structure, just call the `structure.destroy()`
method, this will automatically detach the structure from the parent project.

### project.setStructureLayer(..., layerName)

```javascript
project.setStructureLayer(structure, layerName);
project.setStructureLayer(structureID, layerName);
```

The structure will be added to the end of the new layer, or not moved at all if the structure is already on the target layer.
* `layerName` is **optional**. If it is not provided, the structure will be moved to a layer called `"default"`.

### project.moveStructure(..., layerName)

Change the index of the structure in its current layer relatively to its current index.

```javascript
project.moveStructure(structure, delta);
project.moveStructure(structureID, delta);
```

* `delta` is a relative number. Using a negative number moves the structure closer to the front of its current layer.

### project.moveStructure(..., layerName)

The absolute version of `moveStructure`. Passing a negative `index` means from the end of the layer. `-1` being the last index.

```javascript
project.setStructureIndex(structure, index);
project.setStructureIndex(structureID, index);
```

__NOTE:__ For all these functions, the layer is certified not to be left with holes. This means that moving a structure to an index bigger than the current layer's size will result in the structure being moved to the end of it.

### project.addLayers(...;

Layers are automatically added when you add a structure to an unexisting layer, but you can also add them manually.

```javascript
project.addLayers("layer1");
project.addLayers("layer1", "layer2", ...);
project.addLayers(["layer1", "layer2", ...]);
```

### project.removeLayers(...);

```javascript
project.removeLayers("layer1");
project.removeLayers("layer1", "layer2", ...);
project.removeLayers(["layer1", "layer2", ...]);
```

__NOTE:__ This will remove and **destroy** (`structure.destroy()`) all the structures contained in the layer!


## Blobs

### project.addBlob(...)

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

### project.removeBlob(id)

Removes a blob from the project.

### project.getBlob(id, ...)

Get the blob from its id.

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


### project.getBlobList()

Get the list of all the blobs attached to the project.


## Versioning

### addVersionFilter(sourceSemver, targetVersion, convert)

* `sourceSemver` a [semver](https://github.com/npm/node-semver) string.
* `targetVersion` the resulting version after the conversion.
* `convert` a `function(sProject)` callback where:
  * `sProject` is the project in its serialized form.

__NOTE:__ If there is any ambiguity with filters (for instance, some source versions overlaping), the behaviour is undefined.
