/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /aircrafts              ->  index
 * POST    /aircrafts              ->  create
 * GET     /aircrafts/:id          ->  show
 * PUT     /aircrafts/:id          ->  update
 * DELETE  /aircrafts/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var aircraft = require('./aircraft.model');
var afile = require('../afile/afile.model');
var popQuery = [
                { path: '_afiles', model: 'AFile' },
                { path: '_aimages', model: 'AFile'}];
/*
                { path: '_bld_asm', model: 'Builder' },
                { path: '_bld_kit', model: 'Builder' },
                { path: '_bld_dsn', model: 'Builder' },
                { path: 'components._product', model: 'Product'}];
*/

// Get list of aircrafts
exports.index = function (req, res) {
    var query = req.query;

    var search = (query.search != undefined) ? query.search : null;
    var select = (query.select != undefined) ? query.select : null;
    var perPage = (query.perPage != undefined) ? query.perPage : 10000;
    var page = (query.page != undefined) ? query.page : 0;
    var sort = (query.sort != undefined) ? query.sort : { reg_no: 1 };

    aircraft.find(search)
        .limit(perPage)
        .skip(perPage * page)
        .sort(sort)
        .populate(popQuery).exec(function (err, data) {
            if (err) { return handleError(res, err); }
            
            aircraft.count(search, function (err, count) {
                if (err) { return handleError(res, err); }
                res.setHeader('Cache-Control', 'public, max-age=0');
                
                return res.json(200, {
                    count: count,
                    result: data,
                    type: 'aircraft'
                });
            });
        });
};

// Get a single aircraft
exports.show = function(req, res) {
    aircraft.findById(req.params.id).populate(popQuery).exec(function (err, data) {
        if (err) { return handleError(res, err); }
        if (!data) { return res.send(404); }
        return res.json(data);
    });
};

// Creates a new aircraft in the DB.
exports.create = function (req, res) {
    unpopulateAircraft(req.body);
    aircraft.create(req.body, function (err, data) {
        if (err) { return handleError(res, err); }
        aircraft.populate(data, popQuery, function (err, data) {
            if (err) { return handleError(res, err); }
            if (!data) { return res.send(404); }
            return res.json(201, data);
        });
    });
};

var unpopulateAircraft = function (body) {
    console.info('body: ', body);

    if (body._bld_asm !== undefined && body._bld_asm._id !== undefined)
        body._bld_asm = mongoose.Types.ObjectId(body._bld_asm._id);
    if (body._bld_kit !== undefined && body._bld_kit._id !== undefined)
        body._bld_kit = mongoose.Types.ObjectId(body._bld_kit._id);
    if (body._bld_dsn !== undefined && body._bld_dsn._id !== undefined)
        body._bld_dsn = mongoose.Types.ObjectId(body._bld_dsn._id);
    
    if (body.components) {
        body.components.forEach(function (component) {
            component._product = mongoose.Types.ObjectId(component._product._id);
        });
    }
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

// Updates an existing aircraft in the DB.
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    unpopulateAircraft(req.body);

    aircraft.findById(req.params.id).exec(function (err, data) {
        if (err) { console.log('aircraft update error: ', err); return handleError(res, err); }
        if (!data) { console.log('aircraft update error: not found'); return res.send(404); }
        var updated = _.merge(data, req.body);

        updated.components = req.body.components;
        updated._afiles = req.body._afiles;
        updated._aimages = req.body._aimages;

        /*
        updated._bld_asm = req.body._bld_asm;
        updated._bld_kit = req.body._bld_kit;
        updated._bld_dsn = req.body._bld_dsn;
        */

        updated.markModified('components');
        updated.markModified('_afiles');
        updated.markModified('_aimages');

        /*
        updated.markModified('_bld_asm');
        updated.markModified('_bld_kit');
        updated.markModified('_bld_dsn');
        */

        updated.save(function (err) {
            if (err) { console.log('aircraft update error: ', err); return handleError(res, err); }
            aircraft.findById(req.params.id).populate(popQuery).exec(function (err, data) {
                if (err) { console.log('aircraft update error: ', err); return handleError(res, err); }
                return res.json(200, data);
            });
        });
    });
};

// Deletes a aircraft from the DB.
exports.destroy = function (req, res) {
    aircraft.findById(req.params.id, function (err, aircraft) {
        if (err) { return handleError(res, err); }
        if (!aircraft) { return res.send(404); }
        aircraft.remove(function (err) {
            if (err) { return handleError(res, err); }

            if (aircraft._afiles) {
                aircraft._afiles.forEach(function (item) {
                    afile.findById(item, function (err, afile) {
                        if (afile) afile.remove();
                    });
                });
            }

            if (aircraft._aimages) {
                aircraft._aimages.forEach(function (item) {
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

/*
var createAircraftWithChild = function (aircraft, cb) {
var asyncTasks = [];
var errors = [];

var rollback = function (result, callback) {
if (!result) { callback(); }
else {
//console.log('Rolled-back result: ', result);
if (result.type == 'component') {       // component
Component.find({ _id: result.doc._id }).remove(function (err) {
if (err) { console.log('err : ', err); }
});
}
else if (result.type == '_bld_asm') {  // _bld_asm
Builder.find({ _id: result.doc._id }).remove(function (err) {
if (err) console.log('err : ', err);
});
}
callback();
}
}

aircraft.components.forEach(function (component) {
if (!component.hasOwnProperty('_id')) {
asyncTasks.push(function (callback) {
Component.create(component, function (err, doc) {
if (err) {
errors.push(err);
callback(null, { type: 'error', doc: err });
}
else { callback(null, { type: 'component', doc: doc }) };
});
});
}
});

if (!aircraft._bld_asm.hasOwnProperty('_id')) {
asyncTasks.push(function (callback) {
Builder.create(aircraft._bld_asm, function (err, doc) {
if (err) {
errors.push(err);
callback(null, { type: 'error', doc: err });
}
else { callback(null, { type: '_bld_asm', doc: doc }) };
});
});
}
async.parallel(asyncTasks, function (errs, results) {
if (errors.length > 0) {
console.log('errs : ', errors);

async.each(results, rollback, function () {
console.log('Rollback done.');
cb('Aircraft creation error', null);
});
} else {
aircraft.components = [];

results.forEach(function (result) {
if (result.type == 'component') {
aircraft.components.push(result.doc._id);
}
else if (result.type == '_bld_asm') {  // _bld_asm
aircraft._bld_asm = result.doc._id;
}
});

Aircraft.create(aircraft, function (err, aircraft) {
if (err) {
console.log('aircraft create error: ', err);
async.each(results, rollback, function () {
console.log('Rollback done.');
cb('Aircraft creation error', null);
});
}
else {
console.log('Aircraft', aircraft.reg_no, 'created.');
cb(null, aircraft);
}
});
}
});
}
// Creates a new aircraft in the DB.
exports.create2 = function (req, res) {
createAircraftWithChild(req.body, function(err, data) {
if (err) { return handleError(res, err); }
aircraft.findById(data._id).populate(popQuery).exec(function (err, data) {
if (err) { return handleError(res, err); }
if (!data) { return res.send(404); }
return res.json(201, data);
});
});
};
*/