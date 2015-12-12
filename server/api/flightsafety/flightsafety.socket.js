/**
* Broadcast updates to client when the model changes
*/

'use strict';

var flightsafety = require('./flightsafety.model');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' },
                { path: '_products', model: 'Product' }];

exports.register = function (socket) {
    flightsafety.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    flightsafety.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'flightsafety:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'flightsafety:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    flightsafety.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}
