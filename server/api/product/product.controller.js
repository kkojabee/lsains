/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /products              ->  index
 * POST    /products              ->  create
 * GET     /products/:id          ->  show
 * PUT     /products/:id          ->  update
 * DELETE  /products/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var product = require('./product.model');
var aircraft = require('../aircraft/aircraft.model');
var popQuery = [{ path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'},
                { path: '_manufacturer', model: 'Manufacturer'}];

// Get list of products
exports.index = function (req, res) {
    var query = req.query;
    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { model: 1 };
    product.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .populate(popQuery)
        .sort(sort).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            product.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'product'
                });
            });
        });
};

// Get a single product
exports.show = function(req, res) {
    product.findById(req.params.id).populate('_manufacturer').exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

var unpopulateProduct = function (body) {
    if (body._manufacturer !== undefined && body._manufacturer._id !== undefined)
        body._manufacturer = mongoose.Types.ObjectId(body._manufacturer._id);

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

// Creates a new product in the DB.
exports.create = function (req, res) {
    if (req.body.model === undefined || req.body.model.length < 1) {
        return handleError(res, "모델명을 입력하여 주십시오");
    }
    unpopulateProduct(req.body);
    product.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        product.populate(data, { path: '_manufacturer' }, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

// Updates an existing product in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateProduct(req.body);
    product.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('product update error: ', err); return handleError(res, err); }
        if (!data) { console.log('product update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);

        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;
        updated.markModified('_afiles');
        updated.markModified('_aimages');

        updated.save(function (err) {
            if (err) { console.log('product update error: ', err); return handleError(res, err); }
            product.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('product update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a product from the DB.
exports.destroy = function (req, res) {
    product.findById(req.params.id, function (err, product) {
        if (err) { return handleError(res, err); }
        if (!product) { return res.send(404); }
        aircraft.findOne({ "components._product": product._id }, function (err, result) {
            console.log('err', err, 'result', result);
            if (err) { return handleError(res, err); }
            if (result) { return handleError(res, '항공기 부품에 사용중인 부품형식은 삭제할 수 없습니다.'); }

            product.remove(function (err) {
                if (err) { return handleError(res, err); }
                return res.send(204);
            });
        });
    });
};

function handleError(res, err) {
  return res.send(500, err);
}