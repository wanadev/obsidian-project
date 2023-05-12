# Obsidian Project

[![Lint and test](https://github.com/wanadev/obsidian-project/actions/workflows/tests.yml/badge.svg)](https://github.com/wanadev/obsidian-project/actions/workflows/tests.yml)
[![NPM Version](http://img.shields.io/npm/v/obsidian-project.svg?style=flat)](https://www.npmjs.com/package/obsidian-project)
[![License](http://img.shields.io/npm/l/obsidian-project.svg?style=flat)](https://github.com/wanadev/obsidian-project/blob/master/LICENSE)
[![Discord](https://img.shields.io/badge/chat-Discord-8c9eff?logo=discord&logoColor=ffffff)](https://discord.gg/BmUkEdMuFp)


## Install

    npm install obsidian-project

## Documentation

* http://wanadev.github.io/obsidian-project/


## Contributing

### Questions

If you have any question, you can:

* [Open an issue on GitHub][gh-issue]
* [Ask on discord][discord]

### Bugs

If you found a bug, please [open an issue on Github][gh-issue] with as much information as possible.

### Pull Requests

Please consider [filing a bug][gh-issue] before starting to work on a new feature. This will allow us to discuss the best way to do it. This is of course not necessary if you just want to fix some typo or small errors in the code.

### Coding Style / Lint

To check coding style, run the follwoing command:

    npx grunt jshint

### Tests

Tu run tests, use the following command:

    npx grunt test
    npx grunt test-visual  # to check in your own browser


[gh-issue]: https://github.com/wanadev/obsidian-project/issues
[discord]: https://discord.gg/BmUkEdMuFp


## Changelog

* **[NEXT]** (changes on master but not released yet):

  * Nothing yet ;)

* **v5.0.1:**

  * Updated dependencies (@jbghoul, #54)
  * Replaced deprecated mocha-phantomjs by mocha-headless-chrome to run tests (@jbghoul, #54)

* **v5.0.0:**

  * Fixed addStructure method (@elektree, #47)
  * Updated dependencies (@flozz)

* **v4.0.0:** Updates abitbol-serializable to 2.0.0
* **v3.2.0:** Adds history function to apply currently pointed snapshot and fixes tests
* **v3.1.4:** Fixes obsidian-file options never forwarded on save (#31)
* **v3.1.3:** Fixes issue with Obsidian HTTP Request >= 1.2.0 (#29)
* **v3.1.2:** Fixes history crashes when freeing old blobs (#26)
* **v3.1.1:** Allows unserialization error handler to return a "repaired" structure
* **v3.1.0:** Adds an unserialization error handler
* **v3.0.4:** Updates `uuid` dependency to 3.0.0
* **v3.0.3:** Fixes history do not call the `destroy()` method of deleted structures
* **v3.0.2:** Fixe
* **v3.0.1:** Dependencies updated and minor bug fixed
* **v3.0.0:** Files renamed, and doc added (yuidoc format)
* **v2.1.0:**
  * History management feature implemented (#6)
  * Versioning filter feature implemented (#7)
  * Fixes to allow testing on Windows
* **v2.0.3:** Fixes ignored options and mimetype in `project.addBlob()`
* **v2.0.2:** Small fix
* **v2.0.1:** Updates dependencies
* **v2.0.0:** First public release
