/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var builder = require('./builder.model');

exports.register = function(socket) {
  builder.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  builder.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('builder:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('builder:remove', doc);
}