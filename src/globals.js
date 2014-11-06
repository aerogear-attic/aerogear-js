var Core = requireModule("aerogear.core")['default'];
var Authorization = requireModule("aerogear.authz")['default'];

globals.AeroGear = {
  Core: Core,
  Authorization: Authorization,
  extend: Core.extend
};