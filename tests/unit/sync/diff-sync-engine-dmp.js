(function() {

    module( 'Sync Engine test' );

    test ( 'AeroGear.DiffSyncEngine should support creation without the new keyword', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
        ok( engine , 'Should be no problem not using new when creating' );
    });

    test( 'add document', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'}), doc = { id: 1234, clientId: 'client1', content: { name: 'Fletch' } };
        engine.addDocument( { id: 1234, clientId: 'client1', content: { name: 'Fletch' } } );
        var actualDoc = engine.getDocument( 1234 );
        equal( actualDoc.id, 1234, 'Document id should match' );
    });

    test( 'diff document', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
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

        var diffs = edit.diffs;
        ok( diffs instanceof Array, 'diffs should be an array of tuples' );
        ok( diffs.length === 4, 'there should be 4 diff tuples generated');
        equal ( diffs[0].operation, 'UNCHANGED', 'operation should be UNCHANGED');
        equal ( diffs[0].text, '{"name":"', 'should not change the "name" field');
        equal ( diffs[1].operation, 'DELETE' ,'operation should be DELETE');
        equal ( diffs[1].text, 'Fletch', 'Fletch was the name before the update');
        equal ( diffs[2].operation, 'ADD', 'operation should be ADD');
        equal ( diffs[2].text, 'Mr.Poon', 'Mr.Poon is the new name');
        equal ( diffs[3].operation, "UNCHANGED", 'operation should be UNCHANGED');
        equal ( diffs[3].text, '"}', 'closing bracket');
    });

    test( 'patch document', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
        var doc = { id: 1234, clientId: 'client1', content: {name: 'Fletch' } };
        engine.addDocument( doc );

        var shadowDoc = engine.getShadow( doc.id );

        shadowDoc.content.name = 'Mr.Poon';

        var patch = engine.patchDocument( shadowDoc );
        equal( patch[1][0], true, 'patch should have been successful.' );
        equal( patch[0], '{"name":"Mr.Poon"}', 'name should have been updated to Mr.Poon' );

        doc = engine.getDocument( doc.id );
        equal( doc.content.name, 'Mr.Poon', 'name should be updated');
    });

    test( 'patch shadow - content is a String', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
        var dmp = new diff_match_patch();
        var content = 'Fletch';
        var doc = { id: 1234, clientId: 'client1', content: content };
        var shadow;
        engine.addDocument( doc );
        doc.content = 'John Coctolstol';

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
                diffs: engine._asAeroGearDiffs( dmp.diff_main( JSON.stringify( shadow.content ), JSON.stringify( doc.content ) ) )
            }]
        };
        //var patchMsg = engine.diff( doc );
        console.log('patchMsg', patchMsg);

        var updatedShadow = engine.patchShadow( patchMsg );
        console.log(updatedShadow);
        equal( updatedShadow.content, 'John Coctolstol', 'name should have been updated to John Coctolstol' );
        equal( shadow.serverVersion, 1, 'Server version should have been updated.' );
        equal( shadow.clientVersion, 0, 'Client version should not have been updated.' );
    });

    test( 'patch shadow - content is an Object', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
        var dmp = new diff_match_patch();
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
                diffs: engine._asAeroGearDiffs( dmp.diff_main( JSON.stringify( shadow.content ), JSON.stringify( doc.content ) ) )
            }]
        };
        //var patchMsg = engine.diff( doc );
        console.log('patchMsg', patchMsg);

        var updatedShadow = engine.patchShadow( patchMsg );
        console.log(updatedShadow);
        equal( JSON.stringify(updatedShadow.content), '{"name":"John Coctolstol"}', 'name should have been updated to John Coctolstol' );
        equal( shadow.serverVersion, 1, 'Server version should have been updated.' );
        equal( shadow.clientVersion, 0, 'Client version should not have been updated.' );
    });

    test( 'already seen edit should be deleted', function() {
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
        var dmp = new diff_match_patch();
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
                diffs: engine._asAeroGearDiffs( dmp.diff_main( JSON.stringify( shadow.content ), JSON.stringify( doc.content ) ) )
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
        var engine = AeroGear.DiffSyncEngine({type: 'diffMatchPatch'});
        var dmp = new diff_match_patch();
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
                diffs: engine._asAeroGearDiffs( dmp.diff_main( JSON.stringify( shadow.content ), JSON.stringify( doc.content ) ) )
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
