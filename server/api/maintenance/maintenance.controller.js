/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /maintenances              ->  index
 * POST    /maintenances              ->  create
 * GET     /maintenances/:id          ->  show
 * PUT     /maintenances/:id          ->  update
 * DELETE  /maintenances/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var maintenance = require('./maintenance.model');
var afile = require('../afile/afile.model');
var helper = require('../base/helper');
var popQuery = [
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'}];

// Get list of maintenances
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { reg_no: 1 };

    maintenance.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            maintenance.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'maintenance'
                });
            });
        });
};

// Get a single maintenance
exports.show = function(req, res) {
    maintenance.findById(req.params.id).populate(popQuery).exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

var unpopulateFlightSafety = function (body) {   
    helper.unpopafile(body);
    helper.unpopid(body, '_flightsafety');
}

// Creates a new maintenance in the DB.
exports.create = function (req, res) {
    unpopulateFlightSafety(req.body);
    maintenance.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        maintenance.populate(data, popQuery, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

// Updates an existing maintenance in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateFlightSafety(req.body);

    maintenance.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('maintenance update error: ', err); return handleError(res, err); }
        if (!data) { console.log('maintenance update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);
        
        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;

        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('maintenance update error: ', err); return handleError(res, err); }
            maintenance.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('maintenance update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a maintenance from the DB.
exports.destroy = function (req, res) {
    maintenance.findById(req.params.id, function (err, maintenance) {
        if (err) { return handleError(res, err); }
        if (!maintenance) { return res.send(404); }

        var id = maintenance._id;
        maintenance.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}