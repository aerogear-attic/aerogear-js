# aerogear-js

JavaScript client library implementation for AeroGear. Eventually, this will include API's for persistence, security, data synchronization and more.

## Auth
- - -

The AeroGear.Auth namespace provides an authentication and enrollment API. Through the use of adapters, this library provides common methods like enroll, login and logout that will just work.

See the [Auth API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Auth.html) for more info.

## DataManager
- - -

A collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.

See the [DataManager API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.DataManager.html) for more info.

## Pipeline
- - -

Pipeline is a JavaScript library that provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, both provided and custom, user supplied, this library provides common methods like read, save and delete that will just work.

See the [Pipeline API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Pipeline.html) for more info.

## Building
- - -

### Grunt

[Grunt](http://gruntjs.com/) is used as the build tool which requires [Node.js](http://nodejs.org/) version >= 0.8.0.
Please refer to [nodejs.org](http://nodejs.org) for details regarding installing Node.js.
Please refer to Grunt's [getting started](http://gruntjs.com/getting-started) guide for details regarding installing Grunt.

### Installing Dependencies
To install the dependencies of the project run the following command:

    $ npm install

This will install the versions of the dependencies declared in package.json. This is only requried to be done once before
building the first time, or if the dependencies in package.json have been updated.

### Building the project

    $ grunt

The produced JavaScript will be in the __dist__ directory.
