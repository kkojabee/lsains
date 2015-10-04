/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /builders              ->  index
 * POST    /builders              ->  create
 * GET     /builders/:id          ->  show
 * PUT     /builders/:id          ->  update
 * DELETE  /builders/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var builder = require('./builder.model');
var aircraft = require('../aircraft/aircraft.model');
var popQuery = null;

// Get list of builders
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { name: 1 };

    builder.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort).exec(function (err, data) {
            if (err) { return handleError(res, err); }

            builder.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');

                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'builder'
                });
            });
        });
};

// Get a single builder
exports.show = function(req, res) {
  builder.findById(req.params.id, function (err, builder) {
    if(err) { return handleError(res, err); }
    if(!builder) { return res.send(404); }
    return res.json(builder);
  });
};

var unpopulateBuilder = function (body) {
    if (body._afiles) {
        var afiles = [];
        body._afiles.forEach(function (afile) {
            afiles.push(mongoose.Types.ObjectId(afile._id));
        });
        body._afiles = afiles;
    }
    if (body._aimages) {
        var aimages = [];
        body._aimages.forEach(function (aimage) {
            aimages.push(mongoose.Types.ObjectId(aimage._id));
        });
        body._aimages = aimages;
    }
}

// Creates a new builder in the DB.
exports.create = function (req, res) {
  unpopulateBuilder(req.body);
  builder.create(req.body, function(err, builder) {
    if(err) { return handleError(res, err); }
    return res.json(201, builder);
  });
};

// Updates an existing builder in the DB.
exports.update = function(req, res) {
  if (req.body._id) { delete req.body._id; }
  unpopulateBuilder(req.body);
  builder.findById(req.params.id, function (err, builder) {
    if (err) { return handleError(res, err); }
    if(!builder) { return res.send(404); }
    var updated = _.merge(builder, req.body);

    updated._afiles = req.body._afiles;
    updated._aimages = req.body._aimages;
    updated.markModified('_afiles');
    updated.markModified('_aimages');

    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, builder);
    });
  });
};

// Deletes a builder from the DB.
exports.destroy = function (req, res) {
    builder.findById(req.params.id, function (err, builder) {
        if (err) { return handleError(res, err); }
        if (!builder) { return res.send(404); }

        aircraft.find({
            $or: [{ _bld_asm: builder._id }, { _bld_kit: builder._id }, { _bld_asm: builder._id}]
        }, function (err, results) {
            console.log('err', err, 'results', results);
            if (err) { return handleError(res, err); }
            if (results && results.length > 0) { return handleError(res, '항공기에 사용중인 제작자는 삭제할 수 없습니다.'); }

            builder.remove(function (err) {
                if (err) { return handleError(res, err); }
                return res.send(204);
            });
        });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}