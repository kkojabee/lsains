'use strict';

var mongoose = require('mongoose'),
    AFile  = require('../afile/afile.model'),
    Schema = mongoose.Schema,
    Async = require('async');

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

exports.delAFiles = function(doc, callback) {
  var asyncTasks = [];
  
  // Loop through some items
  doc._afiles.forEach(function(item) {
      asyncTasks.push(function(cb1) {
        AFile.findById(item, function (err, afile) {
          if (afile) afile.remove();
          cb1();
        });
      });
  });

  doc._aimages.forEach(function(item) {
      asyncTasks.push(function(cb2) {
        AFile.findById(item, function (err, afile) {
          if (afile) afile.remove();
          cb2();
        });
      });
  });

  Async.parallel(asyncTasks, function() {
      callback();
  });
}