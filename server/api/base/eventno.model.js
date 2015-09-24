'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventNoSchema = new Schema({
  _id: String,
  event_no: {type: Number, default: 0}
});

module.exports = mongoose.model('EventNo', EventNoSchema);