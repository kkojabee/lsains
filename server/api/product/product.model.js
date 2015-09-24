'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'), 
    EventNo = require('../base/eventno.model'),
    Manufacturer = require('../manufacturer/manufacturer.model'),
    Enums = require('../base/enums');

var model = 'product';

var ProductSchema = BaseSchema.add({
  comp_type: { type: String, default: Enums.COMP_TYPE.OTHERS },
  model: { type: String, trim: true },
  sub_model: { type: String, trim: true },
  revision: { type: String, trim: true, default: '' },
  full_name: { type: String, trim: true },
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

module.exports = mongoose.model('Product', ProductSchema);