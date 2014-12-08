function ModuleResolver(parentResolver) {
  this.parentResolver = parentResolver;
}
ModuleResolver.prototype.resolveModule = function(importedPath, fromModule, container) {
  if (!/\.js$/.test(importedPath)) {
    importedPath += '.js';
  }
  return this.parentResolver.resolveModule(importedPath, fromModule, container);
}
ModuleResolver.prototype.resolvePath = function(importedModuleName, fromModule) {
  return this.parentResolver.resolvePath(importedModuleName, fromModule);
}
ModuleResolver.prototype.resolvePackage = function(modulePath) {
  return this.parentResolver.resolvePackage(modulePath);
}

module.exports = ModuleResolver;