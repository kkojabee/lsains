'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'),
    Person = require('../base/person.model'), 
    EventNo = require('../base/eventno.model'),
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums'),
    Inspection = require('../inspection/inspection.model');

var model = 'insgroup';

var InsGroupSchema = BaseSchema.add({
  title: { type: String, required: true, trim: true },
  date_start: {type: Date, default: Date.now},
  date_end: {type: Date, default: Date.now},
  location: { type: String, trim: true },
  move_type: { type: String, trim: true },
  delegate: Person.Def,
  _inspections: [{ type: Schema.Types.ObjectId, ref: 'Inspection' }]
});

InsGroupSchema.pre('save', function (next) {
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

InsGroupSchema.pre('remove', function (next) {
    var doc = this;

    BaseSchema.delAFiles(doc, function() {
      doc.model('Inspection').update(
        { _insgroup: doc._id },
        { $unset: { _insgroup: true }},
        { multi: true },
        next
      );
    });
});

module.exports = mongoose.model('InsGroup', InsGroupSchema);