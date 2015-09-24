/**
* Broadcast updates to client when the model changes
*/

'use strict';

var aircraft = require('./aircraft.model');
var popQuery = [{ path: '_bld_asm', model: 'Builder' },
                { path: '_bld_kit', model: 'Builder' },
                { path: '_bld_dsn', model: 'Builder' },
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' },
                { path: 'components._product', model: 'Product'}];

exports.register = function (socket) {
    aircraft.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    aircraft.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'aircraft:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'aircraft:remove', doc);
}

function populateAndEmit(socket, event, doc) {
/*
    aircraft.populate(doc, popQuery, function (err, data) {
        if (err) console.log('err', err);
        if (data == null) data = doc;
        socket.emit(event, data);
    });
*/
    aircraft.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}
