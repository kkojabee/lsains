'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Base = require('../base/base.model'),
    EventNo = require('../base/eventno.model');

var model = 'builder';

var BuilderSchema = Base.add({
  name: { type: String, trim: true },
  address: { type: String, trim: true },
  url: String,
  email: String,
  phone: String,
  fax: String
});

BuilderSchema.pre('save', function(next) {
  var doc = this;
  // must add model eventno _id before use model scema !!
  EventNo.findByIdAndUpdate(model, { $inc: { event_no: 1 } }, function (err, eventno) {
    if (err || eventno == null) {
        next(err);
    }
    else {
        doc.event_no = eventno.event_no;
        next();
    }
  });
});

module.exports = mongoose.model('Builder', BuilderSchema);