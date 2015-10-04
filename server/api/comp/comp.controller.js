/**
* Using Rails-like standard naming convention for endpoints.
* GET     /comps              ->  index
* POST    /comps              ->  create
* GET     /comps/:id          ->  show
* PUT     /comps/:id          ->  update
* DELETE  /comps/:id          ->  destroy
*/

'use strict';

var _ = require('lodash');
var comp = require('./comp.model');

// Get list of comps
exports.index = function (req, res) {
    comp.find().populate('_manufacturer').exec(function (err, comps) {
        if (err) { return handleError(res, err); }
        res.setHeader('Cache-Control', 'public, max-age=0');
        return res.json(200, comps);
    });
};

// Get a single comp
exports.show = function (req, res) {
    comp.findById(req.params.id).populate('_manufacturer').exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

// Creates a new comp in the DB.
exports.create = function (req, res) {
    comp.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        comp.populate(data, { path: '_manufacturer' }, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });

    });
};

// Updates an existing comp in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    comp.findById(req.params.id).populate('_manufacturer').exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        var updated = _.merge(data, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.json(200, data);
        });
    });
};

// Deletes a comp from the DB.
exports.destroy = function (req, res) {
    comp.findById(req.params.id, function (err, comp) {
        if (err) { return handleError(res, err); }
        if (!comp) { return res.send(404); }
        comp.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}