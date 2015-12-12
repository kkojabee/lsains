/**
* Broadcast updates to client when the model changes
*/

'use strict';

var certificate = require('./certificate.model');
var popQuery = [{ path: '_aircraft', model: 'Aircraft' },
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'}];

exports.register = function (socket) {
    certificate.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    certificate.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'certificate:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'certificate:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    certificate.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}
