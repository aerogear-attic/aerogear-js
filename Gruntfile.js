var _ = require('lodash');
var sh = require('shelljs');
var path = require('path');
var ModuleResolver = require('./tasks/module-resolver');
var Transpiler = require("es6-module-transpiler");

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
                searchPath: [], // will be filled in initPaths task
                transitiveResolution: true
            },
            dist: {
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
                ],
                externalSources: [
                    'external/uuid/uuid.js',
                    'external/base64/base64.js',
                    'external/crypto/sjcl.js'
                ]
            },
            dataManager: {
                modules: [ 'memory', 'session-local', 'indexeddb', 'websql' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            dataManagerIndexedDB: {
                modules: [ 'indexeddb' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            dataManagerWebSQL: {
                modules: [ 'websql' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            dataManagerSessionLocal: {
                modules: [ 'session-local' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            dataManagerMemory: {
                modules: [ 'memory' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            notifierVertx: {
                modules: [ 'vertx' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            notifierStompWS: {
                modules: [ 'stompws' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: []
            },
            simplePush: {
                modules: [ 'aerogear.simplepush' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: [ 'external/uuid/uuid.js' ]
            },
            unifiedPush: {
                modules: [ 'aerogear.unifiedpush' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: [ 'external/base64/base64.js' ]
            },
            push: {
                modules: [ 'aerogear.simplepush', 'aerogear.unifiedpush' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: [ 'external/uuid/uuid.js', 'external/base64/base64.js' ]
            },
            crypto: {
                modules: [ 'aerogear.crypto' ],
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: [ 'external/crypto/sjcl.js' ]
            },
            oauth2: {
                modules: [ 'oauth2' ],
                destination: [ 'dist/oauth2' ],
                externalSources: [ 'external/uuid/uuid.js' ]
            }
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
            options: {
                preserveComments: 'some',
                sourceMapPrefix: 1,
                beautify: {
                    ascii_only: true
                }
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': [ 'dist/<%= pkg.name %>.js' ]
                },
                options: {
                    sourceMap: 'dist/<%= pkg.name %>.js.map',
                    sourceMappingURL: '<%= pkg.name %>.js.map'
                }
            },
            custom: {
                files: {
                    'dist/<%= pkg.name %>.custom.min.js': [ 'dist/<%= pkg.name %>.custom.js' ]
                },
                options: {
                    sourceMap: 'dist/<%= pkg.name %>.custom.js.map',
                    sourceMappingURL: '<%= pkg.name %>.custom.js.map'
                }
            }
        },
        'multi-stage-sourcemap': {
            dist: {
                from: 'dist/aerogear.min.js.map',
                to: 'dist/aerogear.js.map',
                output: 'dist/aerogear.min.js.map'
            },
            custom: {
                from: 'dist/aerogear.custom.min.js.map',
                to: 'dist/aerogear.custom.js.map',
                output: 'dist/aerogear.custom.min.js.map'
            }
        },
        karma: {
            options: {
                frameworks: ['requirejs', 'qunit'],
                browsers: ['PhantomJS_noSecurity'],
                singleRun: true,
                logLevel: grunt.option('debug') ? 'DEBUG' : 'INFO',
                customLaunchers: {
                    'PhantomJS_noSecurity': {
                        base: 'PhantomJS',
                        options: {
                            settings: {
                                webSecurityEnabled: false
                            }
                        }
                    }
                },
                preprocessors: {
                    'src/**/*.js': 'es6-module-transpiler',
                    'tests/unit/**/*.js': 'es6-module-transpiler'
                },
                moduleTranspiler: {
                    options: {
                        paths: [], // will be filled in initPaths task
                        resolveModuleName: function(filepath) {
                            return path.basename(filepath).replace(/\.js$/, '');
                        }
                    }
                }
            },
            all: {
                options: {
                    files: [
                        'external/uuid/uuid.js',
                        'external/crypto/sjcl.js',
                        'external/base64/base64.js',
                        'tests/vendor/promise-0.1.1.js',
                        'tests/vendor/sockjs.js',
                        'tests/vendor/sinon-1.9.0.js',
                        {pattern: 'src/**/*.js', included: false},
                        {pattern: 'tests/unit/**/*.js', included: false},
                        'tests/module-runner.js'
                    ]
                }
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

    // grunt-contrib tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-es6-module-transpiler');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-karma');

    // Default task
    grunt.registerTask('default', ['initPaths', 'jshint', 'test', 'compile:dist', 'uglify:dist', 'multi-stage-sourcemap:dist']);
    grunt.registerTask('dev', ['initPaths', 'jshint', 'initPaths', 'compile:dist', 'uglify:dist', 'multi-stage-sourcemap:dist']);
    grunt.registerTask('test', ['initPaths', 'karma:all']);
    grunt.registerTask('dataManager', ['initPaths', 'jshint', 'compile:dataManager', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('dataManagerIndexedDB', ['initPaths', 'jshint', 'compile:dataManagerIndexedDB', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('dataManagerWebSQL', ['initPaths', 'jshint', 'compile:dataManagerWebSQL', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('dataManagerSessionLocal', ['initPaths', 'jshint', 'compile:dataManagerSessionLocal', 'iife:custom', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('dataManagerMemory', ['initPaths', 'jshint', 'compile:dataManagerMemory', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('notifierVertx', ['initPaths', 'jshint', 'compile:notifierVertx', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('notifierStompWS', ['initPaths', 'jshint', 'compile:notifierStompWS', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('simplePush', ['initPaths', 'compile:simplePush', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('unifiedPush', ['initPaths', 'compile:unifiedPush', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('push', ['initPaths', 'compile:push', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('crypto', ['initPaths', 'compile:crypto', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('oauth2', ['initPaths', 'compile:oauth2', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    grunt.registerTask('travis', ['default', 'setupCi', 'ci']);

    grunt.loadTasks('tasks');

    grunt.registerTask('docs', function() {
        sh.exec('jsdoc-aerogear src/ -r -d docs README.md');
    });

    grunt.registerTask('initPaths', 'Initializes path variables in compile and karma by scanning src/ and test/unit/ directory structure', function() {
        var config = {},
            srcDirs = {},
            testDirs = {};
        grunt.file.recurse('src/', function callback(abspath, rootdir, subdir, filename) {
            srcDirs[path.dirname(abspath) + '/'] = true;
        });
        grunt.file.recurse('tests/unit/', function callback(abspath, rootdir, subdir, filename) {
            testDirs[path.dirname(abspath) + '/'] = true;
        });
        config.compile = {
            options: {
              searchPath: Object.keys(srcDirs)
            }
        };
        config.karma = {
            options: {
                moduleTranspiler: {
                    options: {
                        paths: Object.keys(srcDirs).concat(Object.keys(testDirs))
                    }
                }
            }
        };
        grunt.config.merge( config );
    });

    grunt.registerMultiTask('compile', 'Generated configuration for transpile, template and concat_sourcemap tasks and then run them', function() {
        var
          target = this.target,
          options = this.options(),
          modules = this.data.modules,
          searchPath = options.searchPath,
          filesToLoad, filesToConcat;

        filesToLoad = modules.map( function( module ) {
            return module + '.js';
        });

        var config = {
            transpile: {
                options: {
                    transitiveResolution: true,
                    resolvers: [ new ModuleResolver(new Transpiler.FileResolver( searchPath )) ]
                }
            },
            continueCompilation: {},
            template: {},
            concat_sourcemap: {}
        };
        config.transpile[target] = {
            formatter: 'amd',
            modules: filesToLoad,
            destination: 'dist/'
        };
        config.continueCompilation[target] = {};

        grunt.config.merge( config );
        grunt.task.run(['transpile:' + target, 'continueCompilation:' + target]);
    });

    grunt.registerMultiTask('continueCompilation', function() {
        var target = this.target,
            compileConfig = grunt.config('compile'),
            transpileConfig = grunt.config('transpile'),
            config = {
                template: {},
                concat_sourcemap: {}
            },
            compiledModules, modulesToLoad, filesToConcat, destination, externalSources;

        destination = compileConfig[target].destination;
        compiledModules = transpileConfig[target].compiledModules;
        externalSources = compileConfig[target].externalSources;
        modulesToLoad = "['" + Object.keys(compiledModules).join("', '") + "']";
        filesToConcat = Object.keys(compiledModules).map(function (name) {
            return compiledModules[name];
        });
        filesToConcat = externalSources.concat(['microlib/banner.js'], filesToConcat, ['.tmp/microlib/footer.js']);

        config.template[target] = {
            files: { '.tmp/microlib/footer.js': ['microlib/footer.js'] },
            options: {
                data: {
                    modules: modulesToLoad
                }
            }
        };
        config.concat_sourcemap[target] = { files: {} };
        config.concat_sourcemap[target].files[destination] = filesToConcat;

        grunt.config.merge( config );
        grunt.task.run(['template:' + target, 'concat_sourcemap:' + target]);
    });

    grunt.registerMultiTask('ci', 'Runs tests in checked out aerogear-js-integration module', function () {
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
            compileTasks = grunt.config.get( "compile" ),
            moduleList = [],
            externalSourceList = [],
            modules,
            externalSources;

        if( options.filter( function( item ) { return item === 'help'; } ).length > 0 ) {
            grunt.log.writeln( grunt.file.read( 'custom_build_help.txt' ) );
            for( var task in compileTasks ) {
                if( task !== 'options' && task !== 'dist' ) {
                    grunt.log.writeln( task + ' - ' + compileTasks[ task ].description  );
                }
            }
            return;
        }

        if( options.length === 1 ) {
            grunt.task.run( ['initPaths', 'compile:' + options, 'uglify:custom', 'multi-stage-sourcemap:custom'] );
            return ;
        }

        for( var i = 0; i < options.length; i++ ) {
            moduleList.push( compileTasks[ options[ i ] ].modules );
            externalSourceList.push( compileTasks[ options[ i ] ].externalSources );
        }
        modules = _.uniq( _.flatten( moduleList ) );
        externalSources = _.uniq( _.flatten( externalSourceList ) );

        grunt.config.set( 'compile', {
            custom: {
                modules: modules,
                destination: [ 'dist/aerogear.custom.js' ],
                externalSources: externalSources
            }
        });

        grunt.task.run(['initPaths', 'compile:custom', 'uglify:custom', 'multi-stage-sourcemap:custom']);
    });
};
