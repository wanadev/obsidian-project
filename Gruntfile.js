"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            tests: ["build/test/"]
        },

        copy: {
            tests: {
                files: [
                    {expand: true, cwd: "test/browser", src: ["index.html"], dest: "build/test/browser"},
                    {expand: true, cwd: "node_modules/mocha/", src: ["mocha.js", "mocha.css"], dest: "build/test/browser"}
                ]
            }
        },

        browserify: {
            test: {
                files: {
                    "build/test/browser/tests.generated.js": ["test/*.js"]
                }
            },
            options: {
                browserifyOptions: {
                    debug: true
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
            },
            runTestBrowser: {
                command: "xdg-open http://localhost:3000/ && sleep 5"
            },
            mocha_headless_chrome: {
                command: "npx mocha-headless-chrome -f http://localhost:3000/ -a no-sandbox",
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask("default", ["test"]);
    grunt.registerTask("test", "Run tests in a web browser", [
        "jshint",
        "clean:tests",
        "copy:tests",
        "browserify:test",
        "shell:serverStart",
        "shell:mocha_headless_chrome",
        "shell:serverStop",
    ]);
    grunt.registerTask("test-visual", "Run tests in a web browser", [
        "jshint",
        "clean:tests",
        "copy:tests",
        "browserify:test",
        "shell:serverStart",
        "shell:runTestBrowser",
        "shell:serverStop",
    ]);

};
