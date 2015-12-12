/**
* Broadcast updates to client when the model changes
*/

'use strict';

var maintenance = require('./maintenance.model');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' },
                { path: '_flightsafety', model: 'FlightSafety' }];

exports.register = function (socket) {
    maintenance.schema.post('save', function (doc) {
        onSave(socket, doc);
    });
    maintenance.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    populateAndEmit(socket, 'maintenance:save', doc);
}

function onRemove(socket, doc, cb) {
    populateAndEmit(socket, 'maintenance:remove', doc);
}

function populateAndEmit(socket, event, doc) {
    maintenance.findById(doc.id).populate(popQuery).exec(function (err, data) {
        if (data == null) data = doc;
        socket.emit(event, data);
    });
}
