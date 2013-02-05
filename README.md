aerogear-js
===========

JavaScript client library implementation for AeroGear. Eventually, this will include API's for persistence, security, data synchronization and more.

Auth
----

The AeroGear.Auth namespace provides an authentication and enrollment API. Through the use of adapters, this library provides common methods like enroll, login and logout that will just work.

See the [Auth API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Auth.html) for more info.

DataManager
-----------

A collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.

See the [DataManager API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.DataManager.html) for more info.

Pipeline
--------

Pipeline is a JavaScript library that provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, both provided and custom, user supplied, this library provides common methods like read, save and delete that will just work.

See the [Pipeline API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Pipeline.html) for more info.

Building
--------
To install the dependencies of the project run the following command: 

    $ npm install
    
This will install the versions of the dependencies declared in package.json.
    
[Grunt](http://gruntjs.com/) is used as the build tool and if you already have Grunt installed you can simply run 
the following command to build the project:

    grunt
    
Installing Grunt
----------------
Aerogear-js uses version 0.4.x and if you have an earlier version of Grunt installed globally, it must be uninstalled first:

    $ npm uninstall -g grunt
    
Grunt requires [Node.js](http://nodejs.org/) version >= 0.8.0  

    $ node --version
    
Find the latest version of node:  

    $ nvm ls-remote
    
Install the version:  

    $ nvm install v0.9.8
    
Use this version:  

    $ nvm use 0.9.8

Now, lets install grunt-cli globally (-g):  

    $ sudo npm install -g grunt-cli@0.1.6
    

And at the project level (from aergoear-js directory) install grunt:  

    $ npm install grunt@0.4.0rc7
    