'use strict';

var mongoose = require('mongoose'),
    AFile  = require('../afile/afile.model'),
    BaseSchema = require('./base.model'), 
    Schema = mongoose.Schema;

var personSchema = BaseSchema.add({
  name: { type: String, trim: true },
  address: { type: String, trim: true },
  url: String,
  email: String,
  phone: String,
  fax: String,
});

exports.add = function(add) {
    if (add) {
        personSchema.add(add);
    }
    return personSchema;
};

exports.Schema = personSchema;