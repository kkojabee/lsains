/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /manufacturers              ->  index
 * POST    /manufacturers              ->  create
 * GET     /manufacturers/:id          ->  show
 * PUT     /manufacturers/:id          ->  update
 * DELETE  /manufacturers/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var product = require('../product/product.model');
var manufacturer = require('./manufacturer.model');

var popQuery = null;

// Get list of manufacturers
exports.index = function (req, res) {
    var query = req.query;
    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { name: 1 };
    manufacturer.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            manufacturer.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');

                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'manufacturer'
                });
            });
        });
};

// Get a single manufacturer
exports.show = function(req, res) {
  manufacturer.findById(req.params.id, function (err, manufacturer) {
    if(err) { return handleError(res, err); }
    if(!manufacturer) { return res.send(404); }
    return res.json(manufacturer);
  });
};

// Creates a new manufacturer in the DB.
exports.create = function (req, res) {
    manufacturer.create(req.body, function (err, manufacturer) {
        if (err) { return handleError(res, err); }
        return res.json(201, manufacturer);
    });
};

// Updates an existing manufacturer in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  manufacturer.findById(req.params.id, function (err, manufacturer) {
    if (err) { return handleError(res, err); }
    if(!manufacturer) { return res.send(404); }
    var updated = _.merge(manufacturer, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, manufacturer);
    });
  });
};

// Deletes a manufacturer from the DB.
exports.destroy = function(req, res) {
  manufacturer.findById(req.params.id, function (err, manufacturer) {
    if(err) { return handleError(res, err); }
    if(!manufacturer) { return res.send(404); }
    manufacturer.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Deletes a product from the DB.
exports.destroy = function (req, res) {
    manufacturer.findById(req.params.id, function (err, manufacturer) {
        if (err) { return handleError(res, err); }
        if (!manufacturer) { return res.send(404); }
        product.findOne({ "_manufacturer": manufacturer._id }, function (err, result) {
            console.log('err', err, 'result', result);
            if (err) { return handleError(res, err); }
            if (result) { return handleError(res, '부품형식에 사용중인 제작자는 삭제할 수 없습니다.'); }

            manufacturer.remove(function (err) {
                if (err) { return handleError(res, err); }
                return res.send(204);
            });
        });
    });
};

function handleError(res, err) {
  console.log('err: ', err);
  return res.send(500, err);
}