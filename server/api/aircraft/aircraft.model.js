'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Async = require('async'),
    BaseSchema = require('../base/base.model'), 
    EventNo = require('../base/eventno.model'),
    Component = require('../component/component.model'),
    Builder = require('../builder/builder.model'),
    Owner = require('../owner/owner.model'),
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums');

var model = 'aircraft';

var AircraftSchema = BaseSchema.add({
    lsa_category: { type: String, default: Enums.LSA_CATEGORY.ULV },
    lsa_type: String,
    reg_no: { type: String, required: true },   // 동일한 신고번호가 있을 수 있다.
    sn: String,
    reg_status: String,
    reg_date: String,
    model: { type: String, trim: true },
    mfg_date: String,
    no_seat: Number,
    gear_type: String,
    place: String,
    ulv_no: String,
    region: String,
    acenter: String,
    reg_type: String,
    ins_due: Date,
    profit: { type: Boolean, default: false },
    components: [Component.ComponentSchema],
    _owner: { type: Schema.Types.ObjectId, ref: 'Owner'},
    _bld_asm: { type: Schema.Types.ObjectId, ref: 'Builder' },
    _bld_kit: { type: Schema.Types.ObjectId, ref: 'Builder' },
    _bld_dsn: { type: Schema.Types.ObjectId, ref: 'Builder' }
});

AircraftSchema.index({ reg_no: 1, reg_status: -1 }); // 동일 등록부호, 등록상태를 가진 데이터는 없다!

AircraftSchema.pre('save', function (next) {
    var doc = this;
    doc.reg_no = doc.reg_no.toUpperCase();
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

AircraftSchema.pre('remove', function (next) {
    var doc = this;

    BaseSchema.delAFiles(doc, function() {
        next();
    });

    // Remove all afiles, aimages before remove aircraft.    
    /*
    Async.each(
        doc._afiles, 
        function(item, cb1) {
            AFile.findById(item, function (err, afile) {
                if (afile) afile.remove();
                cb1();
            });
        }, 
        Async.each(
            doc._aimages, 
            function(item, cb2) {
                AFile.findById(item, function (err, afile) {
                    if (afile) afile.remove();
                    cb2();
                });
            }, 
            function() {
                next();
            }
        )
    );
    */
});


module.exports = mongoose.model('Aircraft', AircraftSchema);