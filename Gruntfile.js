/*global module:false*/
module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %><%= "\\n" %>' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* JBoss, Home of Professional Open Source<%= "\\n" %>' +
                '* Copyright <%= pkg.author.name %>, and individual contributors<%= "\\n" %>' +
                '*<%= "\\n" %>' +
                '* Licensed under the Apache License, Version 2.0 (the "License");<%= "\\n" %>' +
                '* you may not use this file except in compliance with the License.<%= "\\n" %>' +
                '* You may obtain a copy of the License at<%= "\\n" %>' +
                '* <%= pkg.licenses[0].url + "\\n" %>' +
                '* Unless required by applicable law or agreed to in writing, software<%= "\\n" %>' +
                '* distributed under the License is distributed on an "AS IS" BASIS,<%= "\\n" %>' +
                '* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.<%= "\\n" %>' +
                '* See the License for the specific language governing permissions and<%= "\\n" %>' +
                '* limitations under the License.<%= "\\n" %>' +
                '*/<%= "\\n" %>'
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/aerogear.core.js', 'external/uuid/uuid.js', 'external/base64/base64.js', 'src/pipeline/aerogear.pipeline.js', 'src/pipeline/adapters/rest.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/session-local.js', 'src/authentication/aerogear.auth.js', 'src/authentication/adapters/rest.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/simplePush.js', 'src/notifier/adapters/vertx.js', 'src/notifier/adapters/stompws.js', 'src/unifiedpush/aerogear.unifiedpush.js', 'src/simplepush/aerogear.simplepush.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
            pipeline: {
                src: ['src/aerogear.core.js', 'src/pipeline/aerogear.pipeline.js', 'src/pipeline/adapters/rest.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            dataManager: {
                src: ['src/aerogear.core.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/session-local.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            auth: {
                src: ['src/aerogear.core.js', 'src/authentication/aerogear.auth.js', 'src/authentication/adapters/rest.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            notifierVertx: {
                src: ['src/aerogear.core.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/vertx.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            notifierStompWS: {
                src: ['src/aerogear.core.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/stompws.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            simplePush: {
                src: ['src/aerogear.core.js', 'external/uuid/uuid.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/simplePush.js', 'src/simplepush/aerogear.simplepush.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            unifiedPush: {
                src: ['src/aerogear.core.js', 'src/unifiedpush/aerogear.unifiedpush.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            push: {
                src: ['src/aerogear.core.js', 'external/uuid/uuid.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/simplePush.js', 'src/simplepush/aerogear.simplepush.js', 'src/unifiedpush/aerogear.unifiedpush.js'],
                dest: 'dist/<%= pkg.name %>.custom.js'
            }
        },
        qunit: {
            files: ['tests/unit/authentication/**/*.html','tests/unit/data-manager/**/*.html', 'tests/unit/notifier/**/*.html', 'tests/unit/pipeline/**/*.html']
        },
        jshint: {
            all: {
                src: [ 'Gruntfile.js', 'src/**/*.js' ],
                options: {
                    jshintrc: '.jshintrc'
                }
            }
        },
        uglify: {
            all: {
                files: {
                    'dist/<%= pkg.name %>.min.js': [ 'dist/<%= pkg.name %>.js' ]
                },
                options: {
                    preserveComments: 'some',
                    sourceMap: 'dist/<%= pkg.name %>.js.map',
                    sourceMappingURL: '<%= pkg.name %>.js.map',
                    sourceMapPrefix: 1,
                    beautify: {
                        ascii_only: true
                    }
                }
            },
            custom: {
                files: {
                    'dist/<%= pkg.name %>.custom.min.js': [ 'dist/<%= pkg.name %>.custom.js' ]
                },
                options: {
                    preserveComments: 'some',
                    sourceMap: 'dist/<%= pkg.name %>.custom.js.map',
                    sourceMappingURL: '<%= pkg.name %>.js.map',
                    sourceMapPrefix: 1,
                    beautify: {
                        ascii_only: true
                    }
                }
            }
        },
        shell: {
            integrationSetup: {
                command: [
                    'test -d aerogear-js-integration && rm -r aerogear-js-integration || true',
                    'git clone https://github.com/aerogear/aerogear-js-integration.git',
                    'cd aerogear-js-integration',
                    'cp ../dist/aerogear.js .',
                    'cp -rf ../node_modules node_modules'
                ].join('&&'),
                options: {
                    stdout: true
                }
            },
            integrationVertxRunner: {
                command: [
                    './servers/vertxbustest/server.sh',
                    'grunt integration-vertx -v',
                    './servers/vertxbustest/server.sh stop'
                ].join('&&'),
                options: {
                    stdout: true,
                    execOptions: {
                        cwd: 'aerogear-js-integration'
                    }
                }
            },
            integrationActiveMQRunner: {
                command: [
                    './servers/activemqtest/server.sh',
                    'grunt integration-activemq -v',
                    './servers/activemqtest/server.sh stop'
                ].join(' && '),
                options: {
                    stdout: true,
                    execOptions: {
                        cwd: 'aerogear-js-integration'
                    }
                }
            },
            integrationSimplePushRunner: {
                command: [
                    './servers/simplepush/server.sh',
                    'grunt integration-simplepush -v',
                    './servers/simplepush/server.sh stop'
                ].join(' && '),
                options: {
                    stdout: true,
                    execOptions: {
                        cwd: 'aerogear-js-integration'
                    }
                }
            }
        }
    });

    // IIFE wrapper task
    grunt.registerTask('iife', function( custom ) {
        var fs = require('fs'),
            fileName = 'dist/' + grunt.config('pkg').name + (custom ? '.custom' : '') + '.js',
            fileText = fs.readFileSync( fileName, 'utf-8' );

        fileText = fileText.replace( /\*\//, '*/\n(function( window, undefined ) {\n' );
        fs.writeFileSync( fileName, fileText + '})( this );\n', 'utf-8' );
    });

    // grunt-contrib tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-shell');

    // Default task
    grunt.registerTask('default', ['jshint', 'qunit', 'concat:dist', 'iife', 'uglify:all']);
    grunt.registerTask('dev', ['jshint', 'concat:dist', 'iife', 'uglify:all']);
    grunt.registerTask('pipeline', ['jshint', 'qunit', 'concat:pipeline', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('data-manager', ['jshint', 'qunit', 'concat:dataManager', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('auth', ['jshint', 'qunit', 'concat:auth', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('notifierVertx', ['jshint', 'qunit', 'concat:notifierVertx', 'uglify:custom']);
    grunt.registerTask('notifierStompWS', ['jshint', 'qunit', 'concat:notifierStompWS', 'uglify:custom']);
    grunt.registerTask('simplePush', ['concat:simplePush']);
    grunt.registerTask('unifiedPush', ['concat:unifiedPush']);
    grunt.registerTask('push', ['concat:push']);
    grunt.registerTask('travis', ['jshint', 'concat:dist', 'shell:integrationSetup', 'shell:integrationVertxRunner', 'shell:integrationActiveMQRunner', 'shell:integrationSimplePushRunner']);
};
