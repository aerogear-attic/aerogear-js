(function() {

    module( 'JSON Patch - Sync Engine test' );

    test ( 'JSON Patch should be the default engine', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing' }).engines.thing;
        equal( engine instanceof AeroGear.DiffSyncEngine.adapters.jsonPatch , true, 'Should be an instance of jsonpatch adapter' );
    });

    test( 'add document', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing'}).engines.thing, doc = { id: 1234, clientId: 'client1', content: { name: 'Fletch' } };
        engine.addDocument( { id: 1234, clientId: 'client1', content: { name: 'Fletch' } } );
        var actualDoc = engine.getDocument( 1234 );
        equal( actualDoc.id, 1234, 'Document id should match' );
    });

    test( 'diff document', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing'}).engines.thing;
        var doc = { id: 1234, clientId: 'client1', content: { name: 'Fletch' } };
        engine.addDocument( doc );

        // update the name field
        doc.content.name = 'Mr.Poon';

        var patchMsg = engine.diff( doc );
        equal ( patchMsg.msgType, 'patch', 'The message type should be "patch"');
        equal ( patchMsg.id, 1234, 'document id should be 1234');
        equal ( patchMsg.clientId, 'client1', 'clientId should be client1');

        var edit = patchMsg.edits[0];
        equal ( edit.clientVersion, 0, 'version should be zero');
        equal ( edit.serverVersion, 0, 'version should be zero');
        equal ( edit.checksum, '', 'checksum is currently not implemented.');

        var diffs = edit.diffs[0];
        ok( diffs instanceof Array, 'diffs should be an array of tuples' );
        ok( diffs.length === 1, 'there should be 1 diff tuples generated');
        //{op: "replace", path: "/name", value: "Mr.Poon"}
        equal ( diffs[0].op, 'replace', 'operation should be replace');
        equal ( diffs[0].value, 'Mr.Poon','value should be "Mr. Poon"');
        equal ( diffs[0].path, '/name','path should be /name');
    });

    test( 'patch document', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing'}).engines.thing;
        var doc = { id: 1234, clientId: 'client1', content: {name: 'Fletch' } };
        engine.addDocument( doc );

        var shadowDoc = engine.getShadow( doc.id );

        shadowDoc.content.name = 'Mr.Poon';

        var patch = engine.patchDocument( shadowDoc );
        equal( patch, true, 'patch should have been successful.' );

        doc = engine.getDocument( doc.id );
        equal( doc.content.name, 'Mr.Poon', 'name should be updated');
    });

    test( 'patch shadow - content is an Object', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing'}).engines.thing;
        var content = { name: 'Fletch' };
        var doc = { id: 1234, clientId: 'client1', content: content };
        var shadow;
        engine.addDocument( doc );
        doc.content.name = 'John Coctolstol';

        shadow = engine.getShadow( doc.id );

        var patchMsg = {
            msgType: 'patch',
            id: doc.id,
            clientId: shadow.clientId,
            edits: [{
                clientVersion: shadow.clientVersion,
                serverVersion: shadow.serverVersion,
                // currently not implemented but we probably need this for checking the client and server shadow are identical be for patching.
                checksum: '',
                diffs: [jsonpatch.compare(shadow.content, doc.content)]
            }]
        };
        //var patchMsg = engine.diff( doc );
        console.log('patchMsg', patchMsg);

        var updatedShadow = engine.patchShadow( patchMsg );
        equal( JSON.stringify(updatedShadow.content), '{"name":"John Coctolstol"}', 'name should have been updated to John Coctolstol' );
        equal( shadow.serverVersion, 1, 'Server version should have been updated.' );
        equal( shadow.clientVersion, 0, 'Client version should not have been updated.' );
    });

    test( 'already seen edit should be deleted', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing'}).engines.thing;
        var content = { name: 'Fletch' };
        var doc = { id: 1234, clientId: 'client1', content: content };
        var shadow;
        engine.addDocument( doc );
        doc.content.name = 'John Coctolstol';

        shadow = engine.getShadow( doc.id );
        var patchMsg = {
            msgType: 'patch',
            id: doc.id,
            clientId: shadow.clientId,
            edits: [{
                clientVersion: shadow.clientVersion,
                serverVersion: shadow.serverVersion,
                checksum: '',
                diffs: [jsonpatch.compare(shadow.content, doc.content)]
            }]
        };

        // patch twice, second patch should not change the outcome and should simply be discarded.
        engine.patchShadow( patchMsg );
        var updatedShadow = engine.patchShadow( patchMsg );

        equal( JSON.stringify(updatedShadow.content), '{"name":"John Coctolstol"}', 'name should have been updated to John Coctolstol' );
        equal( shadow.serverVersion, 1, 'Server version should have been updated.' );
        equal( shadow.clientVersion, 0, 'Client version should not have been updated.' );
    });

    test( 'restore from backup', function() {
        var engine = AeroGear.DiffSyncEngine({name: 'thing'}).engines.thing;
        var content = { name: 'Fletch' };
        var doc = { id: 1234, clientId: 'client1', content: content };
        var shadow;
        engine.addDocument( doc );
        doc.content.name = 'John Coctolstol';

        shadow = engine.getShadow( doc.id );
        var patchMsg = {
            msgType: 'patch',
            id: doc.id,
            clientId: shadow.clientId,
            edits: [{
                clientVersion: 0,
                serverVersion: 0,
                checksum: '',
                diffs: [jsonpatch.compare(shadow.content, doc.content)]
            }]
        };

        // simulate that the client has performed a diff which will increment the client version.
        shadow.clientVersion = 1;
        engine._saveShadow( shadow );

        var updatedShadow = engine.patchShadow( patchMsg );

        equal( JSON.stringify(updatedShadow.content), '{"name":"John Coctolstol"}', 'name should have been updated to John Coctolstol' );
        equal( shadow.serverVersion, 0, 'Server version should have been updated.' );
        equal( shadow.clientVersion, 1, 'Client version should not have been updated.' );
    });
})();
