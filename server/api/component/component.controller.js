/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /components              ->  index
 * POST    /components              ->  create
 * GET     /components/:id          ->  show
 * PUT     /components/:id          ->  update
 * DELETE  /components/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var component = require('./component.model');
var afile = require('../afile/afile.model');
var helper = require('../base/helper');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'},
                { path: '_product', model: 'Product'}];

// Get list of components
exports.index = function (req, res) {
    var query = req.query;
    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { };

    component.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            component.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');

                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'component'
                });
            });
        });
};


// Get a single component
exports.show = function(req, res) {
    component.findById(req.params.id).populate('_product').exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

var unpopulateComponent = function (body) {
    helper.unpopafile(body);
    helper.unpopid(body._product);
/*
    if (body._product !== undefined && body._product._id !== undefined)
        body._product = mongoose.Types.ObjectId(body._product._id);
*/
}


// Creates a new component in the DB.
exports.create = function (req, res) {
  unpopulateComponent(req.body);
  component.create(req.body, function(err, data) {
      if (err) { return handleError(res, err); }
      component.findById(data._id).populate('_product').exec(function (err, data) {
          if (err) { return handleError(res, err); }
          if (!data) { return res.send(404); }
          return res.json(201, data);
      });
  });
};

// Updates an existing component in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateComponent(req.body);

    component.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('component update error: ', err); return handleError(res, err); }
        if (!data) { console.log('component update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);

        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;
        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('component update error: ', err); return handleError(res, err); }
            component.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('component update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a component from the DB.
exports.destroy = function(req, res) {
  component.findById(req.params.id, function (err, component) {
    if(err) { return handleError(res, err); }
    if(!component) { return res.send(404); }
    component.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}