# obsidian-project: History

`History` is a class that helps managing over-time changes of a project. Features:

* A run-time history binded to a specific project-manager.
* Take snapshots of the current state of a project.
* Go back and forth into the history.
* Changes are applied through a diff, so only properties that have changed are reset.

Example:

```javascript
var History = require("obsidian-project/lib/history");

var history = new History(project, {
    maxLength: 20   // How many snapshots at most (depth of the history stack)
});

history.snapshot(); // Save initial state of our project

// Our project changes, we save this new state
project.addStructure(structure, "foo");
structure.x = 42;
history.snapshot();

history.back();     // Revert back to initial state (structure not in project)
history.forward();  // Cancel revert (structure.x is now 42)
```


## Snapshots

Taking snapshots is at the heart of the History. This is up to the developer to do a `history.snapshot()` whenever a significant change has occured across the project.

```javascript
history.snapshot();
history.clear();    // Remove all stored snapshots 
```

__NOTE:__ Project metadata are not saved into the snapshots. Blobs are only saved as references, and therefore any changes to their inner data are not stored.


## Navigating

```javascript
history.back();
history.forward();
history.go(-3);     // Similar in result to three history.back() in a row
history.go(4);      // Similar in result to four history.forward() in a row
```