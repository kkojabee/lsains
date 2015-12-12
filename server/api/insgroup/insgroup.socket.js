/**
* Broadcast updates to client when the model changes
*/

'use strict';

var insgroup = require('./insgroup.model');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' }];

exports.register = function (socket) {
    insgroup.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    insgroup.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'insgroup:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'insgroup:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    insgroup.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}
