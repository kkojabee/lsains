'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Async = require('async'),
    BaseSchema = require('../base/base.model'), 
    EventNo = require('../base/eventno.model'),
    Manufacturer = require('../manufacturer/manufacturer.model'),
    FlgihtSafety = require('../flightsafety/flightsafety.model'),
    Enums = require('../base/enums');

var model = 'product';

var ProductSchema = BaseSchema.add({
  comp_type: { type: String, default: Enums.COMP_TYPE.OTHERS },
  model: { type: String, trim: true },
  sub_model: { type: String, trim: true },
  revision: { type: String, trim: true, default: '' },
  _manufacturer: { type: Schema.Types.ObjectId, ref: 'Manufacturer' },
  WSC: Boolean,
  AIRPLANE: Boolean,
  GYROPLANE: Boolean,
  PPG: Boolean,
  BALOON: Boolean,
  HELICOPTER: Boolean,
  UAS: Boolean,
  AIRSHIP: Boolean,
  PARAGLIDER: Boolean,
  HANGGLIDER: Boolean,
  PARACHUTE: Boolean
});

ProductSchema.virtual('full_name').get(function () {
  return this.model +
        (this.sub_model ? ' ' + this.sub_model : '') +
        (this.revision ? ' ' + this.revision : '') +
        (this._manufacturer && this._manufacturer._id !== undefined ? ' (' + this._manufacturer.name + ')' : '');
});
ProductSchema.virtual('model_name').get(function () {
  return this.model +
        (this.sub_model ? ' ' + this.sub_model : '');
});
ProductSchema.set('toObject', { virtuals: true })
ProductSchema.set('toJSON', { virtuals: true });

ProductSchema.pre('save', function (next) {
    var doc = this;
    
    // must add model eventno _id before use model schema !!
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

ProductSchema.pre('remove', function (next) {
    BaseSchema.delAFiles(this, function() {
      doc.model('FlightSafety').update(
        { _products: doc._id },
        { $pull: { _products: doc._id }},
        { multi: true },
        next
      );
    });
});

module.exports = mongoose.model('Product', ProductSchema);