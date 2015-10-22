'use strict';

var mongoose = require('mongoose'),
    AFile  = require('../afile/afile.model'),
    BaseSchema = require('./base.model'), 
    Schema = mongoose.Schema;

var personSchema = BaseSchema.add({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  url: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  fax: { type: String, trim: true },
  company:  { type: String, trim: true },
  mobile: { type: String, trim: true }
});

exports.add = function(add) {
    if (add) {
        personSchema.add(add);
    }
    return personSchema;
};

exports.Schema = personSchema;