# Obsidian Project

[![NPM Version](http://img.shields.io/npm/v/obsidian-project.svg?style=flat)](https://www.npmjs.com/package/obsidian-project)
[![License](http://img.shields.io/npm/l/obsidian-project.svg?style=flat)](https://github.com/wanadev/obsidian-project/blob/master/LICENSE)


Documentation:

* [https://github.com/wanadev/obsidian-project/tree/master/doc](https://github.com/wanadev/obsidian-project/tree/master/doc)


## Changelog

* **[NEXT]** (changes on master but not released yet):

  * Fixed addStructure method (@elektree, #47)
  * Updated dependencies (@flozz)

* **4.0.0:** Updates abitbol-serializable to 2.0.0
* **3.2.0:** Adds history function to apply currently pointed snapshot and fixes tests
* **3.1.4:** Fixes obsidian-file options never forwarded on save (#31)
* **3.1.3:** Fixes issue with Obsidian HTTP Request >= 1.2.0 (#29)
* **3.1.2:** Fixes history crashes when freeing old blobs (#26)
* **3.1.1:** Allows unserialization error handler to return a "repaired" structure
* **3.1.0:** Adds an unserialization error handler
* **3.0.4:** Updates `uuid` dependency to 3.0.0
* **3.0.3:** Fixes history do not call the `destroy()` method of deleted structures
* **3.0.2:** Fixe
* **3.0.1:** Dependencies updated and minor bug fixed
* **3.0.0:** Files renamed, and doc added (yuidoc format)
* **2.1.0:**
  * History management feature implemented (#6)
  * Versioning filter feature implemented (#7)
  * Fixes to allow testing on Windows
* **2.0.3:** Fixes ignored options and mimetype in `project.addBlob()`
* **2.0.2:** Small fix
* **2.0.1:** Updates dependencies
* **2.0.0:** First public release
