var transfer = require("multi-stage-sourcemap").transfer;
var shell = require('shelljs');

module.exports = function ( grunt ) {

  grunt.registerTask('multi-stage-sourcemap', function() {
    var uglyToAmd = grunt.file.read('dist/aerogear.js.map');
    var amdToEs6 = grunt.file.read('dist/aerogear.core.js.map');

    var uglyToEs6 = transfer({
      fromSourceMap: uglyToAmd,
      toSourceMap: amdToEs6
      //sourceContent: {
      //  'aerogear.core.js': grunt.file.read('src/aerogear.core.js')
      //}
    });

    grunt.file.write('dist/aerogear.js.map.result', uglyToEs6);
  });
}