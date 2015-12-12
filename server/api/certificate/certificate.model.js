'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BaseSchema = require('../base/base.model'),
    Person = require('../base/person.model'), 
    EventNo = require('../base/eventno.model'),
    AFile  = require('../afile/afile.model'),
    Enums = require('../base/enums'),
    Inspection = require('../inspection/inspection.model');

var model = 'certificate';

var CertificateSchema = BaseSchema.add({
  type: { type: String, trim: true },
  cert_no: { type: String, trim: true, unique: true },
  eg_model: String,
  sn: String,
  mfg_date: String,
  asm_addr: String,
  asm_name: String,
  kit_name: String,
  dsn_name: String,
  rate: String,
  limit: String,
  fpath: String,
  location: { type: String, trim: true },
  date_pub: { type: String, trim: true },
  date_start: { type: String, trim: true },
  date_end: { type: String, trim: true },
  valid: { type: Boolean, default: false },
  invalid_type: { type: String, default: 'WAIT' },
  _aircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
  _inspection: { type: Schema.Types.ObjectId, ref: 'Inspection' }
});

CertificateSchema.statics.getCertNoHeading = function (lsa_category, type) {
  return ((type.toUpperCase() == 'TMP') ? 'T' : 'K') + 
         ((lsa_category.toUpperCase() == 'LSA') ? 'L' : 'Q') + 
         (new Date()).toISOString().substring(2,4) + '-';
}

CertificateSchema.statics.getNextCertNo = function (lsa_category, type, cb) {
  var heading = this.getCertNoHeading(lsa_category, type);
  this.findOne({cert_no: new RegExp(heading, "i")}, {}, { sort: { 'cert_no' : -1 } }, function(err, doc) {    
    var new_cert_no = null;
    if (!err) {
      if (doc) {
        var cert_no = doc.cert_no;
        var cert_no_int_next = parseInt(cert_no.replace(heading, '')) + 1;
        // zero padding for new cert_no (ex: 001, 099)
        if (cert_no_int_next < 100) {
          var s = "00" + cert_no_int_next;
          cert_no_int_next = s.substr(s.length - 3);
        }

        new_cert_no= heading + cert_no_int_next;
      }
      else
        new_cert_no = heading + '001';
    }
    cb(err, new_cert_no);
  });
}

CertificateSchema.statics.getLastCert = function (aircraft, type, valid, cert_no, cb) {
  var query = {_aircraft: aircraft, type: type}; 

  if (valid)
    query.valid = valid;
  if (cert_no)
    query.cert_no = {$lt: cert_no};

  console.log('query: ', query);

  this.findOne(query, {}, { sort: { 'date_pub' : -1 } }, function(err, doc) {
    cb(err, doc);
  });
}

CertificateSchema.pre('save', function (next) {
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

CertificateSchema.pre('remove', function (next) {
    var doc = this;

    BaseSchema.delAFiles(doc, function() {
      doc.model('Inspection').update(
        { _certificate: doc._id },
        { $unset: { _certificate: true }},
        { multi: true },
        next
      );
    });
});

module.exports = mongoose.model('Certificate', CertificateSchema);