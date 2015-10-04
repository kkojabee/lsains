/**
* Broadcast updates to client when the model changes
*/

'use strict';

var inspection = require('./inspection.model');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' }];

exports.register = function (socket) {
    inspection.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    inspection.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'inspection:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'inspection:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    inspection.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}
