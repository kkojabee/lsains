/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /owners              ->  index
 * POST    /owners              ->  create
 * GET     /owners/:id          ->  show
 * PUT     /owners/:id          ->  update
 * DELETE  /owners/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var aircraft = require('../aircraft/aircraft.model');
var owner = require('./owner.model');

var popQuery = null;

// Get list of owners
exports.index = function (req, res) {
    var query = req.query;
    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { name: 1 };
    owner.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            owner.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');

                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'owner'
                });
            });
        });
};

// Get a single owner
exports.show = function(req, res) {
  owner.findById(req.params.id, function (err, owner) {
    if(err) { return handleError(res, err); }
    if(!owner) { return res.send(404); }
    return res.json(owner);
  });
};

// Creates a new owner in the DB.
exports.create = function (req, res) {
    owner.create(req.body, function (err, owner) {
        if (err) { return handleError(res, err); }
        return res.json(201, owner);
    });
};

// Updates an existing owner in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  owner.findById(req.params.id, function (err, owner) {
    if (err) { return handleError(res, err); }
    if(!owner) { return res.send(404); }
    var updated = _.merge(owner, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, owner);
    });
  });
};

// Deletes a owner from the DB.
exports.destroy = function(req, res) {
  owner.findById(req.params.id, function (err, owner) {
    if(err) { return handleError(res, err); }
    if(!owner) { return res.send(404); }
    owner.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Deletes a product from the DB.
exports.destroy = function (req, res) {
    owner.findById(req.params.id, function (err, owner) {
        if (err) { return handleError(res, err); }
        if (!owner) { return res.send(404); }

        aircraft.findOne({ "_owner": owner._id }, function (err, result) {
            console.log('err', err, 'result', result);
            if (err) { return handleError(res, err); }
            if (result) { return handleError(res, '항공기에 사용중인 소유자는 삭제할 수 없습니다.'); }

            owner.remove(function (err) {
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