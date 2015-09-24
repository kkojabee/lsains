'use strict';

var mongoose = require('mongoose'),
    AFile  = require('../afile/afile.model'),
    Schema = mongoose.Schema;

exports.add = function(add) {
    var baseSchema = new Schema({
      event_no: Number,
      created: {type: Date, default: Date.now},
      updated: {type: Date, default: Date.now},
      created_by: String,
      updated_by: String,
      etc: { type: String, trim: true },
      _afiles: [{ type: Schema.Types.ObjectId, ref: 'AFile' }],
      _aimages: [{ type: Schema.Types.ObjectId, ref: 'AFile' }]
    });
    if (add) {
        baseSchema.add(add);
    }
    return baseSchema;
};