"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        browserify: {
            test: {
                files: {
                    "test/browser/tests.generated.js": ["test/*.js"]
                }
            },
            options: {
                browserifyOptions: {
                    debug: true
                }
            }
        },

        mocha_phantomjs: {
            all: ["test/browser/index.html"]
        },

        jshint: {
            all: ["lib/*.js", "bin/*"],
            options: {
                jshintrc: true
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-mocha-phantomjs");
    grunt.loadNpmTasks("grunt-contrib-jshint");

    grunt.registerTask("default", ["test"]);
    grunt.registerTask("test", "Run tests in a web browser", ["jshint", "browserify:test", "mocha_phantomjs"]);

};
