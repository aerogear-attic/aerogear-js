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
                searchPath: [] // will be filled in initPaths task
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
            authorization: {
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
    grunt.loadNpmTasks('grunt-es6-module-transpiler');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-karma');

    // Default task
    grunt.registerTask('default', ['jshint', 'test', 'concat:dist', 'iife', 'uglify:all']);
    grunt.registerTask('dev', ['jshint', 'concat:dist', 'iife', 'uglify:all']);
    grunt.registerTask('dataManager', ['jshint', 'test', 'concat:dataManager', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerIndexedDB', ['jshint', 'test', 'concat:dataManagerIndexedDB', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerWebSQL', ['jshint', 'test', 'concat:dataManagerWebSQL', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerSessionLocal', ['jshint', 'test', 'concat:dataManagerSessionLocal', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('dataManagerMemory', ['jshint', 'test', 'concat:dataManagerMemory', 'iife:custom', 'uglify:custom']);
    grunt.registerTask('notifierVertx', ['jshint', 'test', 'concat:notifierVertx', 'uglify:custom']);
    grunt.registerTask('notifierStompWS', ['jshint', 'test', 'concat:notifierStompWS', 'uglify:custom']);
    grunt.registerTask('simplePush', ['concat:simplePush']);
    grunt.registerTask('unifiedPush', ['concat:unifiedPush']);
    grunt.registerTask('push', ['concat:push']);
    grunt.registerTask('crypto', ['concat:crypto']);
    grunt.registerTask('oauth2', ['concat:oauth2']);
    grunt.registerTask('travis', ['jshint', 'qun:-*it', 'concat:dist', 'setupCi', 'ci']);
    grunt.registerTask('es5', ['initPaths', 'compile:dist']);
    grunt.registerTask('test', ['initPaths', 'karma:authorization']);

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
        }
        grunt.config.merge( config );
    });

    grunt.registerMultiTask('compile', 'Generated configuration for transpile, template and concat_sourcemap tasks and then run them', function() {
        var
          target = this.target,
          options = this.options(),
          modules = this.data.modules,
          searchPath = options.searchPath,
          destination = this.data.destination,
          externalSources = this.data.externalSources,
          filesToLoad, filesToConcat, modulesToLoad;

        filesToLoad = modules.map( function( module ) {
            return module + '.js';
        });
        modulesToLoad = "['" + modules.join("', '") + "']";
        filesToConcat = modules.map( function( module ) {
            return 'dist/' + module + '.js';
        });
        filesToConcat = externalSources.concat(['microlib/banner.js'], filesToConcat, ['.tmp/microlib/footer.js']);

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
        grunt.task.run(['transpile:' + target, 'template:' + target, 'concat_sourcemap:' + target]);
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
