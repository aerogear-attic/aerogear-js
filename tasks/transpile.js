var transpiler = require('es6-module-transpiler');
var AMDFormatter = require('es6-module-transpiler-amd-formatter');
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;

module.exports = function ( grunt ) {

  grunt.registerTask('transpile', function() {
    var container = new Container({
      resolvers: [new FileResolver(['src', 'src/authorization', 'src/authorization/adapters'])],
      formatter: new AMDFormatter()
    });

    container.getModule('aerogear.core.js');
    container.getModule('aerogear.authz.js');
    container.getModule('oauth2.js');
    container.write('dist/');
  });
}