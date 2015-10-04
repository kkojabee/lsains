'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Person = require('../base/person.model'),
    EventNo = require('../base/eventno.model'),
    Enums = require('../base/enums');

var model = 'manufacturer';
var ManufacturerSchema = Person.Schema;

ManufacturerSchema.pre('save', function(next) {
  var doc = this;
  // must add model eventno _id befor use model scema !!
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

module.exports = mongoose.model('Manufacturer', ManufacturerSchema);