'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Person = require('../base/person.model'),
    EventNo = require('../base/eventno.model'),
    Enums = require('../base/enums');

var model = 'owner';
var OwnerSchema = Person.add({
  lsa_category: { type: String, default: Enums.LSA_CATEGORY.ULV },
  lsa_type: String,
  company:  { type: String, trim: true },
  mobile: String,
});

OwnerSchema.virtual('desc').get(function () {
  var isSubVal = (this.mobile || this.phone || this.company);
  return this.name + 
        isSubVal ? '(' : '' +
        (this.mobile ? ' ' + this.mobile : (this.phone ? ' ' + this.phone : '')) +
        (this.company ? ', ' + this.company : '') +
        isSubVal ? ')' : '';
});
OwnerSchema.set('toObject', { virtuals: true })
OwnerSchema.set('toJSON', { virtuals: true });

OwnerSchema.pre('save', function(next) {
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

module.exports = mongoose.model('Owner', OwnerSchema);