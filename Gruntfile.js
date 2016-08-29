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
            all: {
                options: {
                    urls: ["http://localhost:3000/"]
                }
            }
        },

        jshint: {
            all: ["lib/*.js", "bin/*"],
            options: {
                jshintrc: true
            }
        },

        shell: {
            serverStart: {
                command: "npm start"
            },
            serverStop: {
                command: "npm stop"
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-mocha-phantomjs");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask("default", ["test"]);
    grunt.registerTask("test", "Run tests in a web browser", ["jshint", "browserify:test", "shell:serverStart", "mocha_phantomjs", "shell:serverStop"]);

};
