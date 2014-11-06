// expose global AeroGear
globals.AeroGear = requireModule("aerogear.core")['AeroGear'];
// load all modules that we want to leverage (they will load dependencies transitively)
requireModule("oauth2");

})(window);

