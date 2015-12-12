/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /insgroups              ->  index
 * POST    /insgroups              ->  create
 * GET     /insgroups/:id          ->  show
 * PUT     /insgroups/:id          ->  update
 * DELETE  /insgroups/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var insgroup = require('./insgroup.model');
var inspection = require('../inspection/inspection.model');
var afile = require('../afile/afile.model');
var helper = require('../base/helper');
var popQuery = [
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'}];

// Get list of insgroups
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { reg_no: 1 };

    insgroup.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            insgroup.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'insgroup'
                });
            });
        });
};

// Get a single insgroup
exports.show = function(req, res) {
    insgroup.findById(req.params.id).populate(popQuery).exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

// Creates a new insgroup in the DB.
exports.create = function (req, res) {
    unpopulateInsGroup(req.body);
    insgroup.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        insgroup.populate(data, popQuery, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

var unpopulateInsGroup = function (body) {
    helper.unpopafile(body);
    helper.unpoparray(body, '_inspections');
    /*
    if (body._inspections) {
        var inspections = [];
        body._inspections.forEach(function (inspection) {
            inspections.push(mongoose.Types.ObjectId(inspection._id));
        });
        body._inspections = inspections;
    }
    */
}

var unpopulateAircraft = function (body) {   
    helper.unpopafile(body);
 
    if (body.components) {
        body.components.forEach(function (component) {
            helper.unpopid(component, '_product');
        });
    }
}

// Updates an existing insgroup in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateInsGroup(req.body);

    insgroup.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('insgroup update error: ', err); return handleError(res, err); }
        if (!data) { console.log('insgroup update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);
        
        updated._inspections = req.body._inspections;
        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;

        updated.markModified('_inspections');
        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('insgroup update error: ', err); return handleError(res, err); }
            insgroup.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('insgroup update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a insgroup from the DB.
exports.destroy = function (req, res) {
    insgroup.findById(req.params.id, function (err, insgroup) {
        if (err) { return handleError(res, err); }
        if (!insgroup) { return res.send(404); }

        var id = insgroup._id;
        insgroup.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}