var transfer = require("multi-stage-sourcemap").transfer;
var shell = require('shelljs');

module.exports = function ( grunt ) {

  grunt.registerTask('multi-stage-sourcemap', function() {
    var uglyToAmd = grunt.file.read('dist/aerogear.core.es5.js.map');
    var amdToEs6 = grunt.file.read('dist/aerogear.core.amd.js.map');

    var uglyToEs6 = transfer({
      fromSourceMap: uglyToAmd,
      toSourceMap: amdToEs6,
      sourceContent: {
        'aerogear.core.js': grunt.file.read('src/aerogear.core.js')
      }
    });

    shell.mv('-f', 'dist/aerogear.core.es5.js.map', 'dist/aerogear.core.es5.js.map.temp');
    grunt.file.write('dist/aerogear.core.es5.js.map', uglyToEs6);
  });
}