import Notifier from 'aerogear.notifier';
import 'simplePush';
import SimplePushClient from 'aerogear.simplepush';

(function () {

    module("SimplePush Client - Configuration");

    test("create - New SimplePush Client - SimplePush Server specified", function () {
        expect(7);

        var client = SimplePushClient({
            simplePushServerURL: "https://localhost:7777/simplepush",
            useNative: false
        });

        equal(client instanceof SimplePushClient, true, "client should be an instance of SimplePush Client");
        ok(client.options, "Client options exist");
        equal(Object.keys(client.options).length, 2, "Client options are set");
        equal(client.options.simplePushServerURL, "https://localhost:7777/simplepush", "Client SimplePush Server URL is set");
        equal(client.options.useNative, false, "Client useNative flag is set");
        ok(client.simpleNotifier, "SimpleNotifier exists");
        equal(client.simpleNotifier instanceof Notifier.adapters.SimplePush, true, "SimplePush Notifier is created");
    });

    test("create - New SimplePush Client - Native Mozilla SimplePush Server", function () {
        expect(6);

        var client = SimplePushClient({
            useNative: true
        });

        equal(client instanceof SimplePushClient, true, "client should be an instance of SimplePush Client");
        ok(client.options, "Client options exist");
        equal(client.options.simplePushServerURL, "wss://push.services.mozilla.com", "SimplePush Server URL is set to Mozilla SimplePush Server");
        equal(client.options.useNative, true, "Client useNative flag is set");
        ok(client.simpleNotifier, "SimpleNotifier exists");
        equal(client.simpleNotifier instanceof Notifier.adapters.SimplePush, true, "SimplePush Notifier is created");
    });

})();
