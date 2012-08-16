/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* JBoss, Home of Professional Open Source\n' +
                '* Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %>, and individual contributors\n' +
                '*\n' +
                '* Licensed under the Apache License, Version 2.0 (the "License");\n' +
                '* you may not use this file except in compliance with the License.\n' +
                '* You may obtain a copy of the License at\n' +
                '* <%= pkg.licenses[0].url + "\n" %>' +
                '* Unless required by applicable law or agreed to in writing, software\n' +
                '* distributed under the License is distributed on an "AS IS" BASIS,\n' +
                '* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n' +
                '* See the License for the specific language governing permissions and\n' +
                '* limitations under the License.\n' +
                '*/'
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<file_strip_banner:src/aerogear.core.js>', '<file_strip_banner:src/pipeline/aerogear.pipeline.js>', '<file_strip_banner:src/pipeline/adapters/rest.js>'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        qunit: {
            files: ['tests/unit/**/*.html']
        },
        lint: {
            files: ['grunt.js', 'src/**/*.js']
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint qunit'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                jQuery: true,
                aerogear: true
            }
        },
        uglify: {}
    });

    // Default task.
    grunt.registerTask('default', 'lint qunit concat min');

};