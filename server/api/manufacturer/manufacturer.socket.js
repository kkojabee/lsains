/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var manufacturer = require('./manufacturer.model');

exports.register = function(socket) {
  manufacturer.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  manufacturer.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('manufacturer:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('manufacturer:remove', doc);
}