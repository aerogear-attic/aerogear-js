var _ = require('lodash');
var sh = require('shelljs');
var path = require('path');
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
        compile: {
            options: {
                searchPath: ['src', 'src/authorization', 'src/authorization/adapters', 'src/crypto', 'src/unifiedpush', 'src/data-manager', 'src/data-manager/adapters', 'src/notifier', 'src/notifier/adapters', 'src/simplepush' ]
            },
            all: {
                modules: [
                    'aerogear.core',
                    'aerogear.ajax',
                    'aerogear.authz',
                    'oauth2',
                    'aerogear.crypto',
                    'aerogear.unifiedpush',
                    'aerogear.datamanager',
                    'aerogear.datamanager.base',
                    'memory',
                    'session-local',
                    'indexeddb',
                    'websql',
                    'indexeddb',
                    'aerogear.notifier',
                    'aerogear.notifier.base',
                    'mqttws',
                    'simplePush',
                    'stompws',
                    'vertx',
                    'aerogear.simplepush'
                ],
                destination: [
                    'dist/aerogear.js'
                ]
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/aerogear.core.js', 'external/uuid/uuid.js', 'external/base64/base64.js', 'external/crypto/sjcl.js', 'src/aerogear.ajax.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/base.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/session-local.js', 'src/data-manager/adapters/indexeddb.js', 'src/data-manager/adapters/websql.js', 'src/authorization/aerogear.authz.js', 'src/authorization/adapters/oauth2.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/base.js', 'src/notifier/adapters/simplePush.js', 'src/notifier/adapters/vertx.js', 'src/notifier/adapters/stompws.js', 'src/notifier/adapters/mqttws.js', 'src/unifiedpush/aerogear.unifiedpush.js', 'src/simplepush/aerogear.simplepush.js', 'src/crypto/aerogear.crypto.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
            dataManager: {
                src: ['src/aerogear.core.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/base.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/session-local.js', 'src/data-manager/adapters/indexeddb.js', 'src/data-manager/adapters/websql.js'],
                description: 'DataManager full build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            dataManagerIndexedDB: {
                src: ['src/aerogear.core.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/base.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/indexeddb.js'],
                description: 'DataManager IndexedDB adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            dataManagerWebSQL: {
                src: ['src/aerogear.core.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/base.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/websql.js'],
                description: 'DataManager WebSQL adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            dataManagerSessionLocal: {
                src: ['src/aerogear.core.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/base.js', 'src/data-manager/adapters/memory.js', 'src/data-manager/adapters/session-local.js'],
                description: 'DataManager SessionLocal adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            dataManagerMemory: {
                src: ['src/aerogear.core.js', 'src/data-manager/aerogear.datamanager.js', 'src/data-manager/adapters/base.js', 'src/data-manager/adapters/memory.js'],
                description: 'DataManager Memory adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            notifierVertx: {
                src: ['src/aerogear.core.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/base.js', 'src/notifier/adapters/vertx.js'],
                description: 'Notifier Vert.x adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            notifierStompWS: {
                src: ['src/aerogear.core.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/base.js', 'src/notifier/adapters/stompws.js'],
                description: 'Notifier StompWS adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            notifierMqttWS: {
                src: ['src/aerogear.core.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/base.js', 'src/notifier/adapters/mqttws.js'],
                description: 'Notifier MqttWS adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            simplePush: {
                src: ['src/aerogear.core.js', 'external/uuid/uuid.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/simplePush.js', 'src/simplepush/aerogear.simplepush.js'],
                description: 'SimplePush Client build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            unifiedPush: {
                src: ['src/aerogear.core.js', 'external/base64/base64.js', 'src/aerogear.ajax.js', 'src/unifiedpush/aerogear.unifiedpush.js'],
                description: 'UnifiedPush Client build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            push: {
                src: ['src/aerogear.core.js', 'external/uuid/uuid.js', 'external/base64/base64.js', 'src/notifier/aerogear.notifier.js', 'src/notifier/adapters/simplePush.js', 'src/simplepush/aerogear.simplepush.js', 'src/aerogear.ajax.js', 'src/unifiedpush/aerogear.unifiedpush.js'],
                description: 'Build of both SimplePush and UnifiedPush Clients',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            crypto: {
                src: ['src/aerogear.core.js', 'external/crypto/sjcl.js', 'src/crypto/aerogear.crypto.js'],
                description: 'Crypto build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            },
            oauth2: {
                src: ['src/aerogear.core.js', 'src/aerogear.ajax.js', 'external/uuid/uuid.js', 'src/authorization/aerogear.authz.js', 'src/authorization/adapters/oauth2.js'],
                description: 'Authz OAuth2 adapter build',
                dest: 'dist/<%= pkg.name %>.custom.js'
            }
        },
        qunit: {
            authorization: 'tests/unit/authorization/**/*.html',
            dataManager: ['tests/unit/data-manager/**/*.html', 'tests/unit/data-manager-websql/**/*.html'],
            notifier: 'tests/unit/notifier/**/*.html',
            crypto: 'tests/unit/crypto/**/*.html',
            unifiedpush: 'tests/unit/unifiedpush/**/*.html',
            simplepush: 'tests/unit/simplepush/**/*.html',
            aerogearAjax: 'tests/unit/aerogear-ajax/**/*.html'
        },
        jshint: {
            all: {
                src: [ 'Gruntfile.js', 'src/**/*.js' ],
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            tests: {
                src: [ 'tests/unit/**/*.js' ],
                options: {
                    jshintrc: 'tests/.jshintrc'
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
        watch: {
            authorization: {
                files: 'src/authorization/**/*.js',
                tasks: 'qunit:authorization'
            },
            crypto: {
                files: 'src/crypto/**/*.js',
                tasks: 'qunit:crypto'
            },
            dataManager: {
                files: 'src/data-manager/**/*.js',
                tasks: 'qunit:dataManager'
            },
            notifier: {
                files: 'src/notifier/**/*.js',
                tasks: 'qunit:notifier'
            },
            simplepush: {
                files: 'src/simplepush/**/*.js',
                tasks: 'qunit:simplepush'
            },
            unifiedpush: {
                files: 'src/unifiedpush/**/*.js',
                tasks: 'qunit:unifiedpush'
            },
            aerogearAjax: {
                files: 'src/aerogear.ajax.js',
                tasks: ['qunit:aerogearAjax', 'qunit:unifiedpush']
            },
            core: {
                files: 'src/aerogear.core.js',
                tasks: 'qunit'
            }
        },
        ci: {
            options: {
                force: true
            },
            vertx: {},
            activemq: {},
            simplepush: {},
            report: {
                options: { force: false }
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-es6-module-transpiler');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-concat-sourcemap');

    // Default task
    grunt.registerTask('default', ['jshint', 'qunit', 'concat:dist', 'iife', 'uglify:all']);
    grunt.registerTask('dev', ['jshint', 'concat:dist', 'iife', 'uglify:all']);
    grunt.registerTask('dataManager', ['jshint', 'qunit', 'concat:dataManager', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerIndexedDB', ['jshint', 'qunit', 'concat:dataManagerIndexedDB', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerWebSQL', ['jshint', 'qunit', 'concat:dataManagerWebSQL', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerSessionLocal', ['jshint', 'qunit', 'concat:dataManagerSessionLocal', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerMemory', ['jshint', 'qunit', 'concat:dataManagerMemory', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('notifierVertx', ['jshint', 'qunit', 'concat:notifierVertx', 'uglify:custom']);
    grunt.registerTask('notifierStompWS', ['jshint', 'qunit', 'concat:notifierStompWS', 'uglify:custom']);
    grunt.registerTask('simplePush', ['concat:simplePush']);
    grunt.registerTask('unifiedPush', ['concat:unifiedPush']);
    grunt.registerTask('push', ['concat:push']);
    grunt.registerTask('crypto', ['concat:crypto']);
    grunt.registerTask('oauth2', ['concat:oauth2']);
    grunt.registerTask('travis', ['jshint', 'qunit', 'concat:dist', 'setupCi', 'ci']);
    grunt.registerTask('es5', ['compile:all']);

    grunt.registerTask('docs', function() {
        sh.exec('jsdoc-aerogear src/ -r -d docs README.md');
    });

    grunt.registerMultiTask('compile', 'Generated configuration for transpile, template and concat_sourcemap tasks and then run them', function() {
        var
          target = this.target,
          options = this.options(),
          modules = this.data.modules,
          searchPath = options.searchPath,
          destination = this.data.destination,
          filesToLoad, filesToConcat, modulesToLoad;

        filesToLoad = modules.map( function( module ) {
            return module + '.js';
        });
        modulesToLoad = "['" + modules.join("', '") + "']";
        filesToConcat = modules.map( function( module ) {
            return 'dist/' + module + '.js';
        });
        filesToConcat = ['src/microlib/banner.js'].concat(filesToConcat, ['.tmp/microlib/footer.js']);

        var config = {
            transpile: {},
            template: {},
            concat_sourcemap: {}
        };
        config.transpile[target] = {
            formatter: 'amd',
            searchPath: searchPath,
            modules: filesToLoad,
            destination: 'dist/'
        };
        config.template[target] = {
            files: { '.tmp/microlib/footer.js': ['src/microlib/footer.js'] },
            options: {
                data: {
                    modules: modulesToLoad
                }
            }
        };
        config.concat_sourcemap[target] = { files: {} };
        config.concat_sourcemap[target].files[destination] = filesToConcat;

        grunt.config.merge( config );
        grunt.task.run(['transpile:' + target, 'template:' + target, 'concat_sourcemap:' + target]);
    });

    grunt.registerMultiTask('ci', function () {
        var done = this.async();
        var options = this.options({
            force: !!grunt.option('force')
        });
        grunt.util.spawn({
            grunt: true,
            args: ['ci-' + this.target],
            opts: {
                cwd: './aerogear-js-integration',
                stdio: 'inherit'
            }
        }, function (err, result, code) {
            if (err) {
                if (options.force) {
                    grunt.log.ok('Integration tests unstable, continuing...');
                } else {
                    grunt.fail.fatal('Integration tests failed');
                }
            }
            done();
        });
    });

    grunt.registerTask('setupCi', function() {
        sh.config.silent = !grunt.option('verbose');
        sh.config.fatal = true;
        var integrationDir = './aerogear-js-integration/';
        if (sh.test( '-d', integrationDir )) {
            grunt.log.debug( 'The ./aerogear-js-integration seems to be cloned already, exiting' );
        } else {
            if (!sh.which( 'git' )) {
                grunt.fail.fatal( 'The task "prepareCi" requires "git" to work properly' );
                return;
            }
            grunt.log.ok('Cloning project to ' + integrationDir + '...');
            sh.exec( 'git clone https://github.com/aerogear/aerogear-js-integration.git ' + integrationDir );
        }
        if (!sh.test( '-d', path.resolve( integrationDir, './node_modules' ))) {
            if (!sh.which( 'npm' )) {
                grunt.fail.fatal('The task "prepareCi" requires "npm" to work properly');
                return;
            }
            grunt.log.ok('Installing dependencies...');
            sh.pushd( integrationDir );
            sh.exec( 'npm install' );
            sh.popd();
        }
        grunt.log.ok('Copying ./dist/aerogear.js to ' + integrationDir + '...');
        sh.cp('-f', './dist/aerogear.js', path.resolve( integrationDir, './aerogear.js' ));
    });

    // A task to create custom builds of the library based on the 'concat' task
    grunt.registerTask('custom', function( opts ) {
        var options = opts.split( ',' ),
            concatTasks = grunt.config.get( "concat" ),
            tasks = [],
            src;

        if( options.filter( function( item ) { return item === 'help'; } ).length > 0 ) {
            grunt.log.writeln( grunt.file.read( 'custom_build_help.txt' ) );
            for( var task in concatTasks ) {
                if( task !== 'options' && task !== 'dist' ) {
                    grunt.log.writeln( task + ' - ' + concatTasks[ task ].description  );
                }
            }
            return;
        }

        if( options.length === 1 ) {
            grunt.task.run( ['concat:' + options, 'iife:custom', 'uglify:custom'] );
            return ;
        }

        for( var i = 0; i < options.length; i++ ) {
            tasks.push( concatTasks[ options[ i ] ].src );
        }
        src = _.uniq( _.flatten( tasks ) );

        grunt.config.set( 'concat', {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>'
            },
            custom: {
                src: src,
                dest: 'dist/<%= pkg.name %>.custom.js'
            }
        });

        grunt.task.run(['concat:custom', 'iife:custom', 'uglify:custom']);
    });
};
