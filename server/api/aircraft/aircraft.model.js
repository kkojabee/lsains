'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'), 
    EventNo = require('../base/eventno.model'),
    Component = require('../component/component.model'),
    Builder = require('../builder/builder.model'),    
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums');

var model = 'aircraft';

var AircraftSchema = BaseSchema.add({
    lsa_category: { type: String, default: Enums.LSA_CATEGORY.ULV },
    lsa_type: String,
    reg_no: { type: String, required: true, index: true },
    sn: String,
    reg_status: String,
    reg_date: String,
    model: { type: String, trim: true },
    mfg_date: String,
    no_seat: Number,
    gear_type: String,
    owner: String,
    phone: String,
    place: String,
    ulv_no: String,
    region: String,
    acenter: String,
    reg_type: String,
    ins_due: Date,
    profit: { type: Boolean, default: false },
    components: [Component.ComponentSchema],
    _bld_asm: { type: Schema.Types.ObjectId, ref: 'Builder' },
    _bld_kit: { type: Schema.Types.ObjectId, ref: 'Builder' },
    _bld_dsn: { type: Schema.Types.ObjectId, ref: 'Builder' }
});

AircraftSchema.pre('save', function (next) {
    var doc = this;
    doc.reg_no = doc.reg_no.replace(/HL-C/gi, "HLC");
    doc.reg_date = doc.reg_date.replace(/\.|\//g, '-');
    
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

module.exports = mongoose.model('Aircraft', AircraftSchema);