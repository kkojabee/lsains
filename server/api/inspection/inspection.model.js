'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'), 
    Person = require('../base/person.model'), 
    EventNo = require('../base/eventno.model'),
    Aircraft  = require('../aircraft/aircraft.model'),
    Component = require('../component/component.model'),
    Builder = require('../builder/builder.model'),    
    InsGroup = require('../insgroup/insgroup.model'),    
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums');

var model = 'inspection';

var docDef = {
    soc: { type: Boolean, default: false },
    mfg_cap: { type: Boolean, default: false },
    poh: { type: Boolean, default: false },
    mm: { type: Boolean, default: false },
    ipc: { type: Boolean, default: false },
    wb: { type: Boolean, default: false },
    ftest: { type: Boolean, default: false },
    sb_list: { type: Boolean, default: false },
    fm_status: { type: Boolean, default: false },
    use_limit: { type: Boolean, default: false },
    part_replace: { type: Boolean, default: false },
    maint_history: { type: Boolean, default: false }
};

var InspectionSchema = BaseSchema.add({
    app_no: { type: String, required: true, trim: true },
    app_date: {type: Date, default: Date.now},
    rec_no: { type: String, required: true, trim: true },
    rec_date: {type: Date},
    ins_type: { type: String, trim: true },
    ins_type_sub: { type: String, trim: true },
    ins_process: { type: String, trim: true },
    result: { type: Boolean, default: false },
    afm_time: Number,
    eg_time: Number,
    insu_due: { type: Date },
    tax_invoice: { type: Boolean, default: false },
    applicant: Person.Def,
    examinee: Person.Def,
    _certs: [{ type: Schema.Types.ObjectId, ref: 'Certificate' }],
    _maintenances: [{ type: Schema.Types.ObjectId, ref: 'Maintenance' }],
    _aircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
    _insgroup: { type: Schema.Types.ObjectId, ref: 'InsGroup' },
    //_income: { type: Schema.Types.ObjectId, ref: 'Income' }
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

InspectionSchema.pre('remove', function (next) {
    var doc = this;

    BaseSchema.delAFiles(doc, function() {
      doc.model('InsGroup').update(
          { _inspections: doc._id },
          { $pull: { _inspections: doc._id }},
          { multi: true },
        next
      );
    });
});

module.exports = mongoose.model('Inspection', InspectionSchema);