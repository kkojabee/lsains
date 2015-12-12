'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Person = require('../base/person.model'),
    EventNo = require('../base/eventno.model');

var model = 'builder';
var BuilderSchema = Person.Schema;

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

BuilderSchema.pre('remove', function (next) {
    Person.delAFiles(this, function() {
        next();
    });
});


module.exports = mongoose.model('Builder', BuilderSchema);