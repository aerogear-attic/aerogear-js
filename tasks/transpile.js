var transpiler = require('es6-module-transpiler');
var AMDFormatter = require('es6-module-transpiler-amd-formatter');
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;

module.exports = function ( grunt ) {

  grunt.registerTask('transpile', function() {
    var container = new Container({
      resolvers: [new FileResolver(['src'])],
      formatter: new AMDFormatter()
    });

    container.getModule('aerogear.core');
    container.write('dist/aerogear.core.amd.js');
  });
}