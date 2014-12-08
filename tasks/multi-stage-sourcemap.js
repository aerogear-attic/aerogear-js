var transfer = require("multi-stage-sourcemap").transfer;

module.exports = function ( grunt ) {

  grunt.registerMultiTask('multi-stage-sourcemap', function() {
    var data = this.data,
      fromMap, toMap, resultMap;

    fromMap = grunt.file.read( data.from );
    toMap = grunt.file.read( data.to );

    resultMap = transfer({
      fromSourceMap: fromMap,
      toSourceMap: toMap
    });

    grunt.file.write( data.output, resultMap );
  });
}