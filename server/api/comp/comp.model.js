'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'), 
    EventNo = require('../base/eventno.model'),
    Product = require('../product/product.model');

var model = 'comp';

var CompSchema = BaseSchema.add({
  sn: { type: String, trim: true },
  mfg_date: Date,
  tsn: Number,
  tso: Number,
  etc: String,
  product: [Product.ProductSchema]
});

CompSchema.pre('save', function (next) {
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

module.exports = mongoose.model('Comp', CompSchema);