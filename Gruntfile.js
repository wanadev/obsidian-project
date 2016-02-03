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
                command: "node node_modules/.bin/pm2 start -f test/server/server.js --name=obsidian-proxy-server-test --watch && sleep 1"
            },
            serverStop: {
                command: "node node_modules/.bin/pm2 delete obsidian-proxy-server-test"
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
