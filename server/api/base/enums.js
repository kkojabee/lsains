'use strict';

var MFG_TYPE = {
    PART: { label: '부품', value: 0 },
    AIRCRAFT: { label: '항공기', value: 1 }
};

var BLD_TYPE = {
    BLD_ASM: { label: '제작자', value: 0 },
    BLD_KIT: { label: '키트제작자', value: 1 },
    BLD_DSN: { label: '설계자', value: 2 },
};

var COMP_TYPE = {
    AIRFRAME: { label: '기체', value: 0 },
    ENGINE: { label: '엔진', value: 1 },
    PROPELLER: { label: '프로펠러', value: 2 },
    ROTOR: { label: '로터', value: 3 },
    GLIDER: { label: '글라이더', value: 4 },
    CANOPY: { label: '캐노피', value: 5 },
    PARACHUTE: { label: '낙하산', value: 6 },
    HARNESS: { label: '하네스', value: 7 },
    RESCUE: { label: '비상낙하산', value: 8 },
    SPREADER: { label: '스프레더', value: 9 },
    BALOON: { label: '기낭', value: 10 },
    BASKET: { label: '바스켓', value: 11 },
    BURNER: { label: '버너', value: 12 },
    FUELTANK: { label: '연료통', value: 13 },
    AIRSHIP: { label: '비행선', value: 14 },
    INSTRUMENT: { label: '계기', value: 15 },
    DEVICE: { label: '전자장비', value: 16 },
    OTHERS: { label: '기타', value: 17 }
};

var LSA_CATEGORY = {
    ULV: { label: '초경량비행장치', value: 0 },
    LSA: { label: '경량항공기', value: 1 }
};

var GEAR_TYPE = {
    LAND: { label: '육상기', value: 0 },
    WATER: { label: '수상기', value: 1 },
    AMPHIBIAN: { label: '수륙양용기', value: 2 }
};

var AIRCRAFT_TYPE = {
    WSC: { label: '체중이동형', value: 1 },
    AIRPLANE: { label: '타면조종형', value: 2 },
    GYROPLANE: { label: '자이로플레인', value: 3 },
    PPG: { label: '동력패러글라이더', value: 4 },
    BALOON: { label: '기구류', value: 5 },
    HELICOPTER: { label: '헬리콥터', value: 6 },
    UAS: { label: '무인동력비행장치', value: 7 },
    AIRSHIP: { label: '무인비행선', value: 8 },
    PARAGLIDER: { label: '패러글라이더', value: 9 },
    HANGGLIDER: { label: '행글라이더', value: 10 },
    PARACHUTE: { label: '낙하산류', value: 11 },
};

var ULV_TYPE = {
    WSC: { label: '체중이동형비행장치', value: 1 },
    AIRPLANE: { label: '타면조종형비행장치', value: 2 },
    GYROPLANE: { label: '초경량자이로플레인', value: 3 },
    PPG: { label: '동력패러글라이더', value: 4 },
    BALOON: { label: '기구류', value: 5 },
    HELICOPTER: { label: '초경량헬리콥터', value: 6 },
    UAS: { label: '무인동력비행장치', value: 7 },
    AIRSHIP: { label: '무인비행선', value: 8 },
    PARAGLIDER: { label: '패러글라이더', value: 9 },
    HANGGLIDER: { label: '행글라이더', value: 10 },
    PARACHUTE: { label: '낙하산류', value: 11 },
};

var LSA_TYPE = {
    WSC: { label: '체중이동형비행기', value: 1 },
    AIRPLANE: { label: '타면조종형비행기', value: 2 },
    GYROPLANE: { label: '자이로플레인', value: 3 },
    PPG: { label: '동력패러슈트', value: 4 },
    HELICOPTER: { label: '경량헬리콥터', value: 6 }
};

var REG_TYPE = {
    REG: { label: '등록(신고)', value: 1 },
    UNREG: { label: '말소', value: 2 },
    PREREG: { label: '가등록', value: 3 }
};

var REQUIRED_COMP = {
    WSC: { label: '체중이동형', value: ['AIRFRAME', 'ENGINE', 'WING'] },
    AIRPLANE: { label: '타면조종형', value: ['AIRFRAME', 'ENGINE'] },
    GYROPLANE: { label: '자이로플레인', value: ['AIRFRAME', 'ENGINE'] },
    PPG: { label: '동력패러글라이더', value: ['AIRFRAME', 'ENGINE', 'CANOPY'] },
    BALOON: { label: '기구류', value: ['AIRFRAME'] },
    HELICOPTER: { label: '헬리콥터', value: ['AIRFRAME', 'ENGINE'] },
    UAS: { label: '무인동력비행장치', value: ['AIRFRAME', 'ENGINE'] },
    AIRSHIP: { label: '무인비행선', value: ['AIRFRAME', 'ENGINE'] },
    PARAGLIDER: { label: '패러글라이더', value: ['AIRFRAME', 'CANOPY', 'HARNESS', 'RESCUE'] },
    HANGGLIDER: { label: '행글라이더', value: ['AIRFRAME', 'GLIDER', 'HARNESS', 'RESCUE'] },
    PARACHUTE: { label: '낙하산류', value: ['AIRFRAME', 'PARACHUTE', 'HARNESS', 'RESCUE'] }
};

var INSTALLED_COMP = {
    WSC: { label: '체중이동형', value: ['AIRFRAME', 'ENGINE', 'WING', 'PROPELLER'] },
    AIRPLANE: { label: '타면조종형', value: ['AIRFRAME', 'ENGINE', 'PROPELLER'] },
    GYROPLANE: { label: '자이로플레인', value: ['AIRFRAME', 'ENGINE', 'PROPELLER', 'ROTOR'] },
    PPG: { label: '동력패러글라이더', value: ['AIRFRAME', 'ENGINE', 'CANOPY', 'RESCUE'] },
    BALOON: { label: '기구류', value: ['AIRFRAME', 'BALOON', 'BASKET', 'FUELTANK'] },
    HELICOPTER: { label: '헬리콥터', value: ['AIRFRAME', 'ENGINE', 'ROTOR'] },
    UAS: { label: '무인동력비행장치', value: ['AIRFRAME', 'ENGINE'] },
    AIRSHIP: { label: '무인비행선', value: ['AIRFRAME', 'ENGINE', 'AIRSHIP', 'PROPELLER'] },
    PARAGLIDER: { label: '패러글라이더', value: ['AIRFRAME', 'CANOPY', 'HARNESS', 'RESCUE', 'SPREADER'] },
    HANGGLIDER: { label: '행글라이더', value: ['AIRFRAME', 'GLIDER', 'HARNESS', 'RESCUE', 'SPREADER'] },
    PARACHUTE: { label: '낙하산류', value: ['AIRFRAME', 'PARACHUTE', 'HARNESS', 'RESCUE', 'SPREADER'] }
};

var getEnumValues = function (obj) {
    var enumValues = [];
    for (var key in obj) {
        enumValues.push(obj[key].value);
    }
    return enumValues;
};

var getEnumLabels = function (obj) {
    var enumLabels = [];
    for (var key in obj) {
        enumLabels.push(obj[key].label);
    }
    return enumLabels;
};

var getEnumKeys = function (obj) {
    var enumKeys = [];
    for (var key in obj) {
        enumKeys.push(key);
    }
    return enumKeys;
};

var getEnumArray = function (obj) {
    var enumArray = [];
    for (var key in obj) {
        enumArray.push({ label: obj[key].label, value: key });
    }
    return enumArray;
};

exports.COMP_TYPE = COMP_TYPE;
exports.MFG_TYPE = MFG_TYPE;
exports.BLD_TYPE = BLD_TYPE;
exports.LSA_CATEGORY = LSA_CATEGORY;
exports.GEAR_TYPE = GEAR_TYPE;
exports.AIRCRAFT_TYPE = AIRCRAFT_TYPE;
exports.LSA_TYPE = LSA_TYPE;
exports.ULV_TYPE = ULV_TYPE;
exports.REG_TYPE = REG_TYPE;
exports.REQUIRED_COMP = REQUIRED_COMP;
exports.INSTALLED_COMP = INSTALLED_COMP;
exports.getEnumValues = getEnumValues;
exports.getEnumLabels = getEnumLabels;
exports.getEnumKeys = getEnumKeys;
exports.getEnumArray = getEnumArray;
