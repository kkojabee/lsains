/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var async = require('async');
var Q = require('q');
var _ = require('lodash');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var EventNo = require('../api/base/eventno.model');
var Manufacturer = require('../api/manufacturer/manufacturer.model');
var Builder = require('../api/builder/builder.model');
var Product = require('../api/product/product.model');
var Component = require('../api/component/component.model');
var Comp = require('../api/comp/comp.model');
var Aircraft = require('../api/aircraft/aircraft.model');
var AFile = require('../api/afile/afile.model');
var Inspection = require('../api/inspection/inspection.model');
var Owner = require('../api/owner/owner.model');
var Enums = require('../api/base/enums');

EventNo.find({}).remove(function () {
    EventNo.create({
        _id: 'manufacturer'
    }, {
        _id: 'builder'
    }, {
        _id: 'product'
    }, {
        _id: 'component'
    }, {
        _id: 'comp'
    }, {
        _id: 'aircraft'
    }, function () {
        console.log('finished populating eventno');
        manufacturerSeeding();
    });
});

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});

var mfgs = [];
var manufacturerSeeding = function () {
    Manufacturer.find({}).remove(function () {
        Manufacturer.create({
            name: 'Unknown',
            address: 'Unknown',
            url: '',
            email: '',
            phone: '',
            fax: '',
            type: 'PART'
        }, {
            name: 'Rotax Aircraft Engines',
            address: 'BRP-Powertrain GmbH & Co KG, Rotaxstrasse 1, A-4623 Gunskirchen, Austria',
            url: 'http://www.flyrotax.com',
            email: 'info@flyrotax.com',
            phone: '+43 7246 601-0',
            fax: '+43 7246 601-6370',
            type: 'PART'
        }, {
            name: 'I.C.P. s.r.l.',
            address: 'S.P.16 - km 15,150 - 14022 Castelnuovo Don Bosco (AT), Italy',
            url: 'http://www.icpaviazione.it',
            email: 'info@icp.it',
            phone: '011 9927503',
            fax: '011 9927266',
            type: 'AIRCRAFT'
        }, {
            name: 'TECNAM S.r.l.',
            address: 'Via Maiorise 81043 Capua (CE), Italy',
            url: 'http://tecnam.com/',
            email: 'technical.support@tecnam.com',
            phone: ' +39 0823 622297',
            fax: '+39 0823 622899',
            type: 'AIRCRAFT'
        },{
            name: 'Woodcomp s.r.o.',
            address: 'Vodolská 4 250 70 - Odolena Voda, Czech Republic',
            url: 'http://www.woodcomp.cz/',
            email: 'info@woodcomp.cz',
            phone: '00420 283 971 309',
            fax: '00420 283 970 286',
            type: 'PART'
        }, function () {
            console.log('finished populating manufacturers');
            Manufacturer.find({}).sort({ name: 1 }).exec(function (err, data) {
                mfgs = data;
                builderSeeding();
            });
        });
    });
}

var builders = [];
var builderSeeding = function () {
    Builder.find({}).remove(function () {
        Builder.create({
            name: '00.Unknown',
            address: 'Unknown',
            url: '',
            email: '',
            phone: '',
            fax: ''
        }, {
            name: 'I.C.P. s.r.l.',
            address: 'S.P.16 - km 15,150 - 14022 Castelnuovo Don Bosco (AT), Italy',
            url: 'http://www.icpaviazione.it',
            email: 'info@icp.it',
            phone: '011 9927503',
            fax: '011 9927266'
        }, {
            name: '김영호',
            address: '경북 구미시 선산동 원리 1057-166 푸른하늘 비행장',
            url: '',
            email: 'airland21@hanmail.net',
            phone: '010-2502-2676',
            fax: '054-977-9901'
        }, {
            name: '이준호(공주경비행기)',
            address: '충남 공주시 의당면 수촌리 정안이착륙장',
            url: 'http://cafe.daum.net/gongjuair',
            email: 'ds3cwv@hanmail.net',
            phone: '010-5425-2676',
            fax: '041-854-8226'
        }, {
            name: 'TECNAM S.r.l.',
            address: 'Via Maiorise 81043 Capua (CE), Italy',
            url: 'http://tecnam.com/',
            email: 'technical.support@tecnam.com',
            phone: ' +39 0823 622297',
            fax: '+39 0823 622899'
        }, function () {
            console.log('finished populating Builders');
            Builder.find({}).sort({ name: 1 }).exec(function (err, data) {
                builders = data;
                productSeeding();
            });
        });
    });
}

var products = [];
var productSeeding = function () {
    Product.find({}).remove(function () {
        Product.create({
            comp_type: 'ENGINE',
            model: 'Rotax 912',
            sub_model: 'UL',
            test1: 'test1',
            test2: 100,
            full_name: "Rotax 912 UL (Rotax Aircraft Engines)",
            _manufacturer: mfgs[1]._id
        }, {
            comp_type: 'ENGINE',
            model: 'Rotax 912',
            sub_model: 'ULS',
            _manufacturer: mfgs[1]._id,
            full_name: "Rotax 912 ULS (Rotax Aircraft Engines)",
        }, {
            comp_type: 'PROPELLER',
            model: 'SR 30S',
            sub_model: '',
            _manufacturer: mfgs[4]._id,
            full_name: "SR 30S (Woodcomp s.r.o.)",
        }, {
            comp_type: 'AIRFRAME',
            model: 'Bingo',
            sub_model: '',
            _manufacturer: mfgs[0]._id,
            full_name: "BINGO (I.C.P. s.r.l.)",
        }, {
            comp_type: 'AIRFRAME',
            model: 'Savannah',
            sub_model: 'S',
            _manufacturer: mfgs[0]._id,
            full_name: "Savannah S (I.C.P. s.r.l.)",
        },
        function () {
            console.log('finished populating products');

            Product.find({}).sort({comp_type: 1, model: 1, sub_model: 1}).exec(function (err, objs) {
                products = objs;
                ownerSeeding();
            });
        });
    });
}

var owners = [];
var ownerSeeding = function () {
    Owner.find({}).remove(function () {
        Owner.create({
            name: 'Unknown',
            address: 'Unknown',
            url: '',
            email: '',
            phone: '',
            fax: '',
            lsa_category: '',
            lsa_type: ''
        }, {
            name: 'Rotax Aircraft Engines',
            address: 'BRP-Powertrain GmbH & Co KG, Rotaxstrasse 1, A-4623 Gunskirchen, Austria',
            url: 'http://www.flyrotax.com',
            email: 'info@flyrotax.com',
            phone: '+43 7246 601-0',
            fax: '+43 7246 601-6370',
            lsa_category: 'LSA',
            lsa_type: 'AIRPLANE'
        }, {
            name: 'I.C.P. s.r.l.',
            address: 'S.P.16 - km 15,150 - 14022 Castelnuovo Don Bosco (AT), Italy',
            url: 'http://www.icpaviazione.it',
            email: 'info@icp.it',
            phone: '011 9927503',
            fax: '011 9927266',
            lsa_category: 'LSA',
            lsa_type: 'AIRPLANE'
        }, {
            name: 'TECNAM S.r.l.',
            address: 'Via Maiorise 81043 Capua (CE), Italy',
            url: 'http://tecnam.com/',
            email: 'technical.support@tecnam.com',
            phone: ' +39 0823 622297',
            fax: '+39 0823 622899',
            lsa_category: 'LSA',
            lsa_type: 'AIRPLANE'
        },{
            name: 'Woodcomp s.r.o.',
            address: 'Vodolská 4 250 70 - Odolena Voda, Czech Republic',
            url: 'http://www.woodcomp.cz/',
            email: 'info@woodcomp.cz',
            phone: '00420 283 971 309',
            fax: '00420 283 970 286',
            lsa_category: 'LSA',
            lsa_type: 'HELICOPTER'
        },{
            name: '김영호',
            company: '에어랜드항공',
            address: '경북 구미시 선산동 원리 1057-166 푸른하늘 비행장',
            url: '',
            email: 'airland21@hanmail.net',
            mobile: '010-2502-2676',
            phone: '054-977-2676',
            fax: '054-977-9901',
            lsa_category: 'LSA',
            lsa_type: 'AIRPLANE'
        },{
            name: '이준호',
            address: '충남 공주시 의당면 수촌리 정안이착륙장',
            company: '공주경비행기',
            url: '',
            email: 'ds3cwv@hanmail.net',
            mobile: '010-5425-2676',
            phone: '041-852-8226',
            fax: '041-854-8226',
            lsa_category: 'LSA',
            lsa_type: 'AIRPLANE'
        }, function () {
            console.log('finished populating owners');
            Owner.find({}).sort({ name: 1 }).exec(function (err, data) {
                owners = data;
                aFilesSeeding();
            });
        });
    });
}

var aFiles = [];
var aImages = [];
var aFilesSeeding = function () {
    AFile.find({}).remove(function () {
        AFile.create([
            { "file_type": "GEN", "mime_type": "image/jpeg", "uuid_name": "490330e8-a789-46dc-8e6f-ff8dca4aaa0e", "file_name": "Z163886_493015239671_5086621_n.jpg", "ext_name": "jpg" },
            { "file_type": "GEN", "mime_type": "image/png", "uuid_name": "c78b404d-04f7-46a5-8917-c03ff9bbb73c", "file_name": "cctd1-1.png", "ext_name": "png" },
            { "file_type": "GEN", "mime_type": "image/png", "uuid_name": "92a2979e-d193-4cc4-9328-494387f1525b", "file_name": "00CTLS.png", "ext_name": "png" },
            { "file_type": "GEN", "mime_type": "image/png", "uuid_name": "539f854e-fb64-436b-9334-0837676f56fa", "file_name": "dark-black.png", "ext_name": "png" },
            { "file_type": "GEN", "mime_type": "image/jpeg", "uuid_name": "3fc73de0-e36f-4c44-a620-9871f328dd76", "file_name": "data3.jpg", "ext_name": "jpg" },
            { "file_type": "GEN", "mime_type": "image/jpeg", "uuid_name": "403a81b7-8ec3-443d-b45a-a5f38a49c6e8", "file_name": "img.jpg", "ext_name": "jpg" },
            { "file_type": "GEN", "mime_type": "image/jpeg", "uuid_name": "62986f6b-ad09-4261-8502-4f5682e95ae9", "file_name": "wallpaper.jpg", "ext_name": "jpg" },
            { "file_type": "GEN", "mime_type": "image/jpeg", "uuid_name": "ed596e8a-ccc2-4e97-807c-bec5481ac6d3", "file_name": "HLC001.jpg", "ext_name": "jpg" },
            { "file_type": "GEN", "mime_type": "application/haansofthwp", "uuid_name": "3b79c699-0dd4-4a37-9e69-74e41dfd6923", "file_name": "HLC196 인증검사 신청 서류 사전 검토 결과.hwp", "ext_name": "hwp" },
            { "file_type": "GEN", "mime_type": "application/pdf", "uuid_name": "9380e028-dfb2-42ca-8a8d-27ec8ca4c711", "file_name": "SB024.pdf", "ext_name": "pdf" }
        ],
        function (err, results) {
            if (err) { console.log('err: ', err); }
            if (results) { }

            AFile.find({ mime_type: { $ne: "image/jpeg"} }).sort({ ext_name: 1, file_name: 1 }).exec(function (err, objs) {
                aFiles = objs;
                AFile.find({ mime_type: new RegExp('^image.+$', "i") }).sort({ file_name: 1 }).exec(function (err, objs) {
                    aImages = objs;
                    console.log('finished populating afiles');
                    aircraftSeeding();
                });
            });
        });
    });
}


var aircraftSeeding = function () {
    //Q.all([Q.nfcall(componentRemoving), Q.nfcall(builderRemoving)]).then(function () {

    var aircraft1 = {
        lsa_category: 'LSA',
        lsa_type: 'AIRPLANE',
        reg_no: 'HL-C024',
        sn: '08-07-51-741',
        reg_status: 'REG',
        reg_date: '2010-02-18',
        model: 'BINGO',
        mfg_date: '2009-04-27',
        no_seat: 2,
        gear_type: 'LAND',
        place: '경북 구미시 선산동 원리 1057-166 푸른하늘 비행장',
        ulv_no: 'B2086',
        region: 'KB',
        acenter: 'BC',
        reg_type: 'ULV',
        ins_due: '',
        _owner: owners[5]._id,
        components: [{
            sn: '08-07-51-741',
            mfg_date: '2009.04.27',
            tsn: '100.3',
            tso: '100.3',
            installed: true,
            _product: products[0]._id
        }, {
            sn: '5652799',
            mfg_date: '2009.03.24',
            tsn: '100.3',
            tso: '100.3',
            installed: true,
            _product: products[2]._id
        }],
        _bld_asm: builders[2],
        _bld_kit: builders[1],
        _bld_dsn: builders[1],
        _afiles: [aFiles[0]._id, aFiles[1]._id],
        _aimages: [aImages[0]._id, aImages[1]._id]
    };

    var aircraft2 = {
        lsa_category: 'LSA',
        lsa_type: 'AIRPLANE',
        reg_no: 'HL-C044',
        sn: '10-07-54-0012',
        reg_status: 'REG',
        reg_date: '2010-08-26',
        model: 'SAVANNAH S',
        mfg_date: '2010-08-16',
        no_seat: 2,
        gear_type: 'LAND',
        place: '충남 공주시 의당면 수촌리 정안이착륙장',
        ulv_no: 'B2086',
        region: 'KB',
        acenter: 'BC',
        reg_type: 'ULV',
        ins_due: '',
        _owner: owners[6]._id,
        components: [{
            sn: '10-07-54-0012',
            mfg_date: '2010.08.16',
            tsn: '400.3',
            tso: '400.3',
            installed: true,
            _product: products[1]._id
        }, {
            sn: '4409843',
            mfg_date: '2010.04.15',
            tsn: '400.3',
            tso: '400.3',
            installed: true,
            _product: products[3]._id
        }],
        _bld_asm: builders[3],
        _bld_kit: builders[1],
        _bld_dsn: builders[1],
        _afiles: [aFiles[0]._id, aFiles[1]._id],
        _aimages: [aImages[0]._id, aImages[1]._id]
    };

    var air_org = [aircraft1, aircraft2];
    var aircrafts = [];
    var acount = 30;
    for (var i = 0; i < acount; i++) {
        var reg_no = 'HLC' + (100 + i);
        var aircrafto = air_org[i%2];
        var aircraft = _.clone(aircrafto);
        aircraft.components = _.clone(aircrafto.components);
        aircraft.reg_no = reg_no;
        aircrafts.push(aircraft);
    };

    Aircraft.find({}).remove(function () {
        Aircraft.create(aircrafts,
            function (err, results) {
                if (err) { console.log('err: ', err); }
                if (results) { }

                console.log('finished populating aircrafts');
            });
    });
    //});
}

    /*
    var compSeeding = function () {
    Product.find({}).exec(function (err, products) {
    if (err || products == null) { return console.log('find products error!'); }

    Comp.find({}).remove(function () {
    Comp.create({
    sn: '5652799',
    mfg_date: '2009.03.24',
    tsn: '100.3',
    tso: '100.3',
    product: [products[0]]
    }, {
    sn: '4409843',
    mfg_date: '2010.04.15',
    tsn: '400.3',
    tso: '400.3',
    product: [{
    comp_type: 'engine',
    model: 'Rotax 912',
    sub_model: 'UL',
    _manufacturer: mfgs[1]._id
    }]
    }, {
    sn: '08-07-51-741',
    mfg_date: '2009.04.27',
    tsn: '100.3',
    tso: '100.3',
    product: [{
    comp_type: 'engine',
    model: 'Rotax 912',
    sub_model: 'UL',
    _manufacturer: mfgs[1]._id
    }]
    }, {
    sn: '10-07-54-0012 ',
    mfg_date: '2010.08.16 ',
    tsn: '400.3',
    tso: '400.3',
    product: [{
    comp_type: 'engine',
    model: 'Jabiru 2200',
    _manufacturer: mfgs[1]._id
    }]
    },
    function (err, results) {
    if (err) { console.log('err: ', err); }
    if (results) { console.log('results: ', results); }

    console.log('finished populating comps');
    });
    });


    //        Comp.find({}).remove(function () {
    //            Comp.create({
    //                sn: '5652799',
    //                mfg_date: '2009.03.24',
    //                tsn: '100.3',
    //                tso: '100.3',
    //                product: [products[1]]
    //            }, {
    //                sn: '4409843',
    //                mfg_date: '2010.04.15',
    //                tsn: '400.3',
    //                tso: '400.3',
    //                product: [products[0]]
    //            }, {
    //                sn: '08-07-51-741',
    //                mfg_date: '2009.04.27',
    //                tsn: '100.3',
    //                tso: '100.3',
    //                product: [products[2]]
    //            }, {
    //                sn: '10-07-54-0012 ',
    //                mfg_date: '2010.08.16 ',
    //                tsn: '400.3',
    //                tso: '400.3',
    //                product: [products[3]]
    //            },
    //            function (err, results) {
    //                if (err) { console.log('err: ', err); }
    //                if (results) { console.log('results: ', results); }

    //                console.log('finished populating comps');
    //            });
    //        });
    });
    }

    var componentSeeding = function () {
    Product.find({}).exec(function (err, products) {
    if (err || products == null) { return console.log('find products error!'); }

    Component.find({}).remove(function () {
    Component.create({
    sn: '5652799',
    mfg_date: '2009.03.24',
    tsn: '100.3',
    tso: '100.3',
    _product: products[1]._id
    }, {
    sn: '4409843',
    mfg_date: '2010.04.15',
    tsn: '400.3',
    tso: '400.3',
    _product: products[0]._id
    }, {
    sn: '08-07-51-741',
    mfg_date: '2009.04.27',
    tsn: '100.3',
    tso: '100.3',
    _product: products[2]._id
    }, {
    sn: '10-07-54-0012 ',
    mfg_date: '2010.08.16 ',
    tsn: '400.3',
    tso: '400.3',
    _product: products[3]._id
    },
    function () {
    console.log('finished populating components');
    });
    });
    });
    }

    var componentRemoving = function (callback) {
    Component.find({}).remove(function (err) {
    console.log('finished removing component');
    callback();
    });
    }

    var builderRemoving = function (callback) {
    Builder.find({}).remove(function (err) {
    console.log('finished removing builder');
    callback();
    });
    }

    var createAircraftWithChild1 = function (aircraft) {
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
    });
    }
    else {
    console.log('Aircraft', aircraft.reg_no, 'created.');
    }
    });
    }
    });
    }

    var createAircraftWithChild2 = function (aircraft) {
    var components = aircraft.components;
    var builder = aircraft.builder;

    aircraft.components.forEach(function (component) {
    if (!component.hasOwnProperty('_id')) {
            
    myParent.children.push(myChild);
            
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
    }
    */