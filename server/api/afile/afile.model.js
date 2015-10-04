'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Enums = require('../base/enums'),
    fs = require('fs');

var model = 'afile';
var basePath = __dirname + '\\..\\uploaded\\';
var removeFileOnDelete = false;

var AFileSchema = new Schema({
    file_type: String,
    mime_type: String,
    uuid_name: String,
    file_name: String,
    ext_name: String,    
    file_size: Number,
    info: String,
    order: {type: Number, default: 100},
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    created_by: String,
    updated_by: String
});

AFileSchema.post('remove', function (doc) {
    console.log("AFileSchema.post('remove') called");
    if (removeFileOnDelete) {
        var uuid_path = basePath + doc.uuid_name;
        fs.unlink(uuid_path);
    }
});

module.exports = mongoose.model('AFile', AFileSchema);
module.exports.basePath = basePath;