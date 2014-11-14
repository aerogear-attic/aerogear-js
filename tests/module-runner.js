(function() {


  function moduleName(path) {
    return basename(path).replace(/\.js$/, '');
  }

  function modulePath(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
  }

  function basename(path) {
    return path.split('/').reverse()[0];
  }

  var tests = [],
      paths = {};

  for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
      if (/\.spec\.js$/.test(file)) {
        tests.push(moduleName(file));
        paths[moduleName(file)] = modulePath(file);
      }
      if (/\/src\//.test(file)) {
        paths[moduleName(file)] = modulePath(file);
      }
    }
  }

  requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    paths: paths,

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
  });
})();