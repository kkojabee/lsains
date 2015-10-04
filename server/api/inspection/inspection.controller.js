/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /inspections              ->  index
 * POST    /inspections              ->  create
 * GET     /inspections/:id          ->  show
 * PUT     /inspections/:id          ->  update
 * DELETE  /inspections/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var inspection = require('./inspection.model');
var afile = require('../afile/afile.model');
var popQuery = [
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'}];

// Get list of inspections
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { reg_no: 1 };

    inspection.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            inspection.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'inspection'
                });
            });
        });
};

// Get a single inspection
exports.show = function(req, res) {
    inspection.findById(req.params.id).populate(popQuery).exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

// Creates a new inspection in the DB.
exports.create = function (req, res) {
    unpopulateinspection(req.body);
    inspection.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        inspection.populate(data, popQuery, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

var unpopulateinspection = function (body) {
    console.info('body: ', body);
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

// Updates an existing inspection in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateinspection(req.body);

    inspection.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('inspection update error: ', err); return handleError(res, err); }
        if (!data) { console.log('inspection update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);
        
        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;

        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('inspection update error: ', err); return handleError(res, err); }
            inspection.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('inspection update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a inspection from the DB.
exports.destroy = function (req, res) {
    inspection.findById(req.params.id, function (err, inspection) {
        if (err) { return handleError(res, err); }
        if (!inspection) { return res.send(404); }
        inspection.remove(function (err) {
            if (err) { return handleError(res, err); }

            if (inspection._afiles) {
                inspection._afiles.forEach(function (item) {
                    afile.findById(item, function (err, afile) {
                        if (afile) afile.remove();
                    });
                });
            }

            if (inspection._aimages) {
                inspection._aimages.forEach(function (item) {
                    afile.findById(item, function (err, afile) {
                        if (afile) afile.remove();
                    });
                });
            }

            return res.send(204);
        });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}