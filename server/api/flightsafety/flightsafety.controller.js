/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /flightsafetys              ->  index
 * POST    /flightsafetys              ->  create
 * GET     /flightsafetys/:id          ->  show
 * PUT     /flightsafetys/:id          ->  update
 * DELETE  /flightsafetys/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var flightsafety = require('./flightsafety.model');
var maintenance = require('../maintenance/maintenance.model');
var afile = require('../afile/afile.model');
var helper = require('../base/helper');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile' },
                { path: '_products', model: 'Product' }];

// Get list of flightsafeties
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { date_rev: 1 };

    flightsafety.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            flightsafety.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'flightsafety'
                });
            });
        });
};

// Get a single flightsafety
exports.show = function(req, res) {
    flightsafety.findById(req.params.id).populate(popQuery).exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

var unpopulateFlightSafety = function (body) {   
    helper.unpopafile(body);
    helper.unpoparray(body, '_products');
    helper.unpopid(body, '_flightsafety');
}

// Creates a new flightsafety in the DB.
exports.create = function (req, res) {
    unpopulateFlightSafety(req.body);
    if(!req.body.date_rev && req.body.date_pub)
        req.body.date_rev = req.body.date_pub;

    flightsafety.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        flightsafety.populate(data, popQuery, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

// Updates an existing flightsafety in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateFlightSafety(req.body);

    flightsafety.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('flightsafety update error: ', err); return handleError(res, err); }
        if (!data) { console.log('flightsafety update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);
        
        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;

        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('flightsafety update error: ', err); return handleError(res, err); }
            flightsafety.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('flightsafety update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a flightsafety from the DB.
exports.destroy = function (req, res) {
    flightsafety.findById(req.params.id, function (err, flightsafety) {
        if (err) { return handleError(res, err); }
        if (!flightsafety) { return res.send(404); }

        var id = flightsafety._id;
        // 해당 SB가 정비기록에 포함되어 있는 경우 또는 특정 SB의 child인 경우에는 삭제할 수 없다.
        maintenance.find({ 
            _flightsafety: id
        }, function (err, results) {
            console.log('err', err, 'results', results);
            if (err) { return handleError(res, err); }
            if (results && results.length > 0) { return handleError(res, '정비기록에 사용중인 SB 내역은 삭제할 수 없습니다.'); }

            flightsafety.remove(function (err) {
                if (err) { return handleError(res, err); }
                return res.send(204);
            });
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}