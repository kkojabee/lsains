'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');

var hasid = function(array) {
  return (array && array.length > 0 && array[0]._id !== undefined);
}

module.exports.unpopafile = function(doc) {
  if (hasid(doc._afiles)) {
    var afiles = [];
    doc._afiles.forEach(function (afile) {
      afiles.push(mongoose.Types.ObjectId(afile._id));
    });
    doc._afiles = afiles;
  }
  if (hasid(doc._aimages)) {
    var aimages = [];
    doc._aimages.forEach(function (aimage) {
      aimages.push(mongoose.Types.ObjectId(aimage._id));
    });
    doc._aimages = aimages;
  }
}

var unpopid = function(body, dname) {
  if (body[dname] !== undefined && body[dname]._id !== undefined)
  	body[dname] = mongoose.Types.ObjectId(body[dname]._id);
}

module.exports.unpopid = unpopid;
module.exports.unpopids = function(body, props) {
  var id = null;	
  props.forEach(function (prop) {
    unpopid(body, prop)
  });
}

module.exports.unpoparray = function(body, arrname) {
	if (body[arrname] !== undefined && body[arrname]) {
		var narray = [];
    body[arrname].forEach(function(item) {
        if (item._id !== undefined)
        	narray.push(mongoose.Types.ObjectId(item._id));
        else
        	narray.push(item);
    });
    body[arrname] =narray;
	}
}
