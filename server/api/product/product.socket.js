/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var product = require('./product.model');

var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' },
                { path: '_manufacturer', model: 'Manufacturer'}];

exports.register = function (socket) {
    product.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    product.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'product:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'product:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    product.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}

