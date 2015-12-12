'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'),
    Aircraft = require('../aircraft/aircraft.model'),
    Person = require('../base/person.model'), 
    EventNo = require('../base/eventno.model'),
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums');

var model = 'maintenance';

var MaintenanceSchema = BaseSchema.add({
  title: String,
  type: { type: String, trim: true },
  sch_type: { type: String, trim: true },
  comp_type: { type: String, trim: true },
  date_start: Date,
  date_end: Date,
  worker: String,
  inspector: String,
  content: String,
  _aircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
  _flightsafety: { type: Schema.Types.ObjectId, ref: 'FlightSafety' }
});

MaintenanceSchema.pre('save', function (next) {
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

MaintenanceSchema.pre('remove', function (next) {
    var doc = this;

    BaseSchema.delAFiles(doc, function() {
      doc.model('Inspection').update(
          { _maintenances: doc._id },
          { $pull: { _maintenances: doc._id }},
          { multi: true },
        next
      );
    });
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);