/**
* Broadcast updates to client when the model changes
*/

'use strict';

var component = require('./component.model');

exports.register = function (socket) {
    component.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    component.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'component:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'component:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    component.populate(doc, { path: '_product' }, function (err, doc) {
        socket.emit(event, doc);
    });
}
