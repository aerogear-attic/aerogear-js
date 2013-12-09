# aerogear-js [![Build Status](https://travis-ci.org/aerogear/aerogear-js.png)](https://travis-ci.org/aerogear/aerogear-js)

JavaScript client library implementation for AeroGear. Eventually, this will include API's for persistence, security, data synchronization and more. For more information and downloads, visit [AeroGear.org](http://aerogear.org/javascript).

## Auth
- - -

The AeroGear.Auth namespace provides an authentication and enrollment API. Through the use of adapters, this library provides common methods like enroll, login and logout that will just work.

See the [Auth API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Auth.html) for more info.

## Crypto
- - -

The AeroGear.Crypto namespace provides a straightforward API to provide an easy to use cryptography interface for data encryption and decryption.

See the [Crypto API Docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Crypto.html) for more info.

## DataManager
- - -

A collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.

See the [DataManager API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.DataManager.html) for more info.

## Notifier
- - -

Notifier is a collection of adapters which provide a unified or similar API for interacting with different messaging services and protocols.

See the [Notifier API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Notifier.html) for more info.

## Pipeline
- - -

Pipeline is a JavaScript library that provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, both provided and custom, user supplied, this library provides common methods like read, save and delete that will just work.

See the [Pipeline API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.Pipeline.html) for more info.

## SimplePushClient
- - -

SimplePushClient is a client implementation and polyfill for the Mozilla SimplePush specification. SimplePush allows for simple push notification support in web, as well as Firefox OS, applications. This implementation does differ slightly from the specification in that it only works in applications that are "online" and active in the browser. This implementation also supports connecting to both Mozilla's SimplePush server as well as the AeroGear project's server.

See the [SimplePushClient API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.SimplePushClient.html) for more info. Also, please see the [Mozilla SimplePush specification](https://wiki.mozilla.org/WebAPI/SimplePush) for more info on SimplePush.

## UnifiedPushClient
- - -

UnifiedPushClient is used in conjunction with AeroGear's UnifiedPush server to register web applications for push notifications. Using the SimplePushClient, a web application can register for push notifications from a SimplePush network and then inform the UnifiedPush server as to where it should send those push notifications.

See the [UnifiedPushClient API docs](http://aerogear.org/docs/specs/aerogear-js/AeroGear.UnifiedPushClient.html) for more info.

## Feature Stability
- - -

All features of the library are given a stability rating which is noted in the documentation for that feature. The stability ratings are as follows:

* <strong class="labelExperimental">Experimental</strong> - This feature is new and has not been thoroughly tested outside of development. This feature could be changed or removed at any time. Use of these features in a production environment is at your own risk.
* <strong class="labelStable">Stable</strong> - This feature has existed for a full release cycle and has been thoroughly tested. These features are considered safe for use in production environments.
* <strong class="labelDeprecated">Deprecated</strong> - This feature is being removed or replaced. As with experimental features, these features could be removed at any time and their use in production environments is at your own risk. For features being replaced, it is recommended to update to the next version and begin using the new feature.

## Library Dependencies
- - -

Some parts of AeroGear.js depend on external libraries which are not bundled in the same file. Below is a list of each plugin and their adapters along with external dependencies, if they have any. It is recommended to use the latest stable version of each dependency unless otherwise noted.

### Auth

* **REST**
    * [jQuery](http://jquery.com/download/)

### Crypto
* [SJCL](https://github.com/bitwiseshiftleft/sjcl) - bundled w/ AeroGear.js

### DataManager

* **Memory**
    * [jQuery](http://jquery.com/download/)
* **SessionLocal**
    * [jQuery](http://jquery.com/download/)
* **IndexedDB**
    * [jQuery](http://jquery.com/download/)
* **WebSQL**
    * [jQuery](http://jquery.com/download/)

### Notifier

* **STOMP-WS**
    * [STOMP Over WebSocket](https://github.com/jmesnil/stomp-websocket/)
* **vert.x**
    * [vert.x Event Bus](http://vertx.io/downloads.html)
    * [SockJS](http://cdn.sockjs.org/)
* **SimplePush**
    * See SimplePush Plugin

### Pipeline

* **REST**
    * [jQuery](http://jquery.com/download/)

### SimplePush
* [jQuery](http://jquery.com/download/)
* [SockJS](http://cdn.sockjs.org/)

### UnifiedPush
* [jQuery](http://jquery.com/download/)

## Building
- - -

### Grunt

[Grunt](http://gruntjs.com/) is used as the build tool which requires [Node.js](http://nodejs.org/) version >= 0.10.
Please refer to [nodejs.org](http://nodejs.org) for details regarding installing Node.js.
Please refer to Grunt's [getting started](http://gruntjs.com/getting-started) guide for details regarding installing Grunt.

### Installing Build Dependencies
To install the dependencies of the project run the following command:

    $ npm install

This will install the versions of the dependencies declared in package.json. This is only required to be done once before
building the first time, or if the dependencies in package.json have been updated.

### Building the project

    $ grunt

The produced JavaScript will be in the __dist__ directory.

### Generating the documentation
To generate the API docs, run the following command:

    $ jsdoc-aerogear src/ -r -d docs README.md

or by running the grunt `docs` task

    $ grunt docs

_The docs use a slightly modified version of jsdoc_
