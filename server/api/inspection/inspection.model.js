'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'), 
    EventNo = require('../base/eventno.model'),
    Aircraft  = require('../aircraft/aircraft.model'),
    Component = require('../component/component.model'),
    Builder = require('../builder/builder.model'),    
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums');

var model = 'aircraft';

var InspectionSchema = BaseSchema.add({
});

InspectionSchema.pre('save', function (next) {
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

module.exports = mongoose.model('Inspection', InspectionSchema);