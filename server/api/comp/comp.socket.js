/**
* Broadcast updates to client when the model changes
*/

'use strict';

var comp = require('./comp.model');

exports.register = function (socket) {
    comp.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    comp.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    socket.emit('comp:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('comp:remove', doc);
}