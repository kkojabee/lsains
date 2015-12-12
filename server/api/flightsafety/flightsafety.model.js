'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'),
    Person = require('../base/person.model'), 
    EventNo = require('../base/eventno.model'),
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums');

var model = 'flightsafety';

var FlightSafetySchema = BaseSchema.add({
  type: { type: String, trim: true },
  valid: { type: Boolean, default: false },
  mandatory: { type: Boolean, default: false },
  pubno: { type: String, trim: true },
  pubno_sub: { type: String, trim: true },
  pubno_prv: { type: String, trim: true },
  pubno_rev: String,
  pubno_sub_rev: String,
  title: { type: String, trim: true },
  content: String,    
  date_pub: String,  
  date_rev: String,
  sn: { type: String, trim: true, default: 'REF' },
  date_wdue: String,
  time_wdue: String,
  repeat: { type: Boolean, default: false },
  comp_type: String,
  _products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});

FlightSafetySchema.virtual('pubno_full').get(function () {
  return this.pubno +
        (this.pubno_rev ? ' ' + this.pubno_rev : '');
});
FlightSafetySchema.virtual('pubno_sub_full').get(function () {
  return this.pubno_sub +
        (this.pubno_sub_rev ? ' ' + this.pubno_sub_rev : '');
});
FlightSafetySchema.set('toObject', { virtuals: true })
FlightSafetySchema.set('toJSON', { virtuals: true });

FlightSafetySchema.pre('save', function (next) {
    var doc = this;
    
    // must add model eventno _id befor use model scema !!
    EventNo.findByIdAndUpdate(model, { $inc: { event_no: 1} }, function (err, eventno) {
        if (err || eventno == null) {
            next(err);
        }
        else {
            doc.event_no = eventno.event_no;
            next();
        }
    });
});

FlightSafetySchema.pre('remove', function (next) {
    var doc = this;

    BaseSchema.delAFiles(doc, function() {
      next();
    });
});

module.exports = mongoose.model('FlightSafety', FlightSafetySchema);