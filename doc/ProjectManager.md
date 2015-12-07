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
var ProjectManager = require("wanadev-project-manager");

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


## Adding Structures And Layers To The Project

TODO


## Attaching Resources (Blob) To The Project

TODO
