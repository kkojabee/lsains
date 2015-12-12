'use strict';
angular.module('insApp')
  .factory('Enums', function () {
      // 제작자 유형
      var MFG_TYPE = {
          PART: { label: '부품', value: 'PART' },
          AIRCRAFT: { label: '항공기', value: 'AIRCRAFT' }
      };

      // 기체 제작자 유형
      var BLD_TYPE = {
          BLD_ASM: { label: '제작자', value: 'BLD_ASM' },
          BLD_KIT: { label: '키트제작자', value: 'BLD_KIT' },
          BLD_DSN: { label: '설계자', value: 'BLD_DSN' },
      };

      // 초경량/경량항공기 분류
      var LSA_CATEGORY = {
          ULV: { label: '초경량비행장치', value: 'ULV' },
          LSA: { label: '경량항공기', value: 'LSA' }
      };

      // 육상기/수상기 분류
      var GEAR_TYPE = {
          LAND: { label: '육상기', value: 'LAND' },
          WATER: { label: '수상기', value: 'WATER' },
          AMPHIBIAN: { label: '수륙양용기', value: 'AMPHIBIAN' }
      };

      // 초경량/경량항공기 일반 분류
      var AIRCRAFT_TYPE = {
          WSC: { label: '체중이동형', slabel: '체중', value: 'WSC' },
          AIRPLANE: { label: '타면조종형', slabel: '타면', value: 'AIRPLANE' },
          GYROPLANE: { label: '자이로플레인', slabel: '자이로', value: 'GYROPLANE' },
          PPG: { label: '동력패러글라이더', slabel: '동패', value: 'PPG' },
          BALOON: { label: '기구류', slabel: '기구', value: 'BALOON' },
          HELICOPTER: { label: '헬리콥터', slabel: '헬기', value: 'HELICOPTER' },
          UAS: { label: '무인동력비행장치', slabel: '무인', value: 'UAS' },
          AIRSHIP: { label: '무인비행선', slabel: '비행선', value: 'AIRSHIP' },
          PARAGLIDER: { label: '패러글라이더', slabel: '패러', value: 'PARAGLIDER' },
          HANGGLIDER: { label: '행글라이더', slabel: '행글', value: 'HANGLIDER' },
          PARACHUTE: { label: '낙하산류', slabel: '낙하선', value: 'PARACHUTE' },
      };

      // 초경량 비행장치 종류
      var ULV_TYPE = {
          WSC: { label: '체중이동형비행장치', value: 'WSC' },
          AIRPLANE: { label: '타면조종형비행장치', value: 'AIRPLANE' },
          GYROPLANE: { label: '초경량자이로플레인', value: 'GYROPLANE' },
          PPG: { label: '동력패러글라이더', value: 'PPG' },
          BALOON: { label: '기구류', value: 'BALOON' },
          HELICOPTER: { label: '초경량헬리콥터', value: 'HELICOPTER' },
          UAS: { label: '무인동력비행장치', value: 'UAS' },
          AIRSHIP: { label: '무인비행선', value: 'AIRSHIP' },
          PARAGLIDER: { label: '패러글라이더', value: 'PARAGLIDER' },
          HANGGLIDER: { label: '행글라이더', value: 'HANGGLIDER' },
          PARACHUTE: { label: '낙하산류', value: 'PARACHUTE' },
      };

      // 경량항공기 종류
      var LSA_TYPE = {
          WSC: { label: '체중이동형비행기', value: 'WSC' },
          AIRPLANE: { label: '타면조종형비행기', value: 'AIRPLANE' },
          GYROPLANE: { label: '자이로플레인', value: 'GYROPLANE' },
          PPG: { label: '동력패러슈트', value: 'PPG' },
          HELICOPTER: { label: '경량헬리콥터', value: 'HELICOPTER' }
      };

      // 등록 상태
      var REG_STATUS = {
          REG: { label: '등록(신고)', value: 'REG' },
          UNREG: { label: '말소', value: 'UNREG' },
          PREREG: { label: '가등록', value: 'PREREG' }
      };
      
      // 경량항공기 등록 유형
      var REG_TYPE = {
          NEW: { label: '신규', value: 'NEW' },
          USED: { label: '중고', value: 'USED' },
          ULV: { label: '전환', value: 'ULV' },
          UNREG:  { label: '무등록', value: 'UNREG' },
      };
      
      // 부품 종류
      var COMP_TYPE = {
          AIRFRAME: { label: '기체', value: 'AIRFRAME' },
          ENGINE: { label: '엔진', value: 'ENGINE' },
          PROPELLER: { label: '프로펠러', value: 'PROPELLER' },
          ROTOR: { label: '로터', value: 'ROTOR' },
          GLIDER: { label: '글라이더', value: 'GLIDER' },
          CANOPY: { label: '캐노피', value: 'CANOPY' },
          PARACHUTE: { label: '낙하산', value: 'PARACHUTE' },
          HARNESS_PI: { label: '하네스(조종자)', value: 'HARNESS_PI' },
          HARNESS_PA: { label: '하네스(탑승자)', value: 'HARNESS_PA' },
          RESCUE: { label: '비상낙하산', value: 'RESCUE' },
          SPREADER: { label: '스프레더', value: 'SPREADER' },
          BALOON: { label: '기낭', value: 'BALOON' },
          BASKET: { label: '바스켓', value: 'BASKET' },
          BURNER: { label: '버너', value: 'BURNER' },
          FUELTANK: { label: '연료통', value: 'FUELTANK' },
          AIRSHIP: { label: '비행선', value: 'AIRSHIP' },
          INSTRUMENT: { label: '계기', value: 'INSTRUMENT' },
          DEVICE: { label: '전자장비', value: 'DEVICE' },
          OTHERS: { label: '기타', value: 'OTHERS' }
      };

      // 경량항공기 종류별로 필수 장착 부품 타입
      var REQUIRED_COMP = {
          WSC: { label: '체중이동형', values: ['AIRFRAME', 'ENGINE'] },
          AIRPLANE: { label: '타면조종형', values: ['AIRFRAME', 'ENGINE'] },
          GYROPLANE: { label: '자이로플레인', values: ['AIRFRAME', 'ENGINE'] },
          PPG: { label: '동력패러글라이더', values: ['AIRFRAME', 'ENGINE'] },
          BALOON: { label: '기구류', values: ['BALOON'] },
          HELICOPTER: { label: '헬리콥터', values: ['AIRFRAME', 'ENGINE'] },
          UAS: { label: '무인동력비행장치', values: ['AIRFRAME'] },
          AIRSHIP: { label: '무인비행선', values: ['AIRSHIP'] },
          PARAGLIDER: { label: '패러글라이더', values: ['CANOPY'] },
          HANGGLIDER: { label: '행글라이더', values: ['GLIDER'] },
          PARACHUTE: { label: '낙하산류', values: ['PARACHUTE'] }
      };

      // 경량항공기 종류별로 장착가능한 부품 타입
      var INSTALLABLE_COMP = {
          WSC: { label: '체중이동형', values: ['AIRFRAME', 'ENGINE', 'GLIDER', 'PROPELLER', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          AIRPLANE: { label: '타면조종형', values: ['AIRFRAME', 'ENGINE', 'PROPELLER', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          GYROPLANE: { label: '자이로플레인', values: ['AIRFRAME', 'ENGINE', 'PROPELLER', 'ROTOR', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          PPG: { label: '동력패러글라이더', values: ['AIRFRAME', 'ENGINE', 'CANOPY', 'RESCUE', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          BALOON: { label: '기구류', values: ['BALOON', 'BASKET', 'BURNER', 'FUELTANK', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          HELICOPTER: { label: '헬리콥터', values: ['AIRFRAME', 'ENGINE', 'ROTOR', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          UAS: { label: '무인동력비행장치', values: ['AIRFRAME', 'ENGINE', 'PROPELLER', 'ROTOR', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          AIRSHIP: { label: '무인비행선', values: ['AIRSHIP', 'ENGINE', 'PROPELLER', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          PARAGLIDER: { label: '패러글라이더', values: ['CANOPY', 'HARNESS_PI', 'HARNESS_PA', 'RESCUE', 'SPREADER', 'INSTRUMENT', 'DEVICE', 'OTHERS' ] },
          HANGGLIDER: { label: '행글라이더', values: ['GLIDER', 'HARNESS_PI', 'HARNESS_PA', 'RESCUE', 'SPREADER', 'INSTRUMENT', 'DEVICE', 'OTHERS'] },
          PARACHUTE: { label: '낙하산류', values: ['PARACHUTE', 'HARNESS_PI', 'HARNESS_PA', 'RESCUE', 'SPREADER', 'INSTRUMENT', 'DEVICE', 'OTHERS'] }
      };

      /*
      var REQUIRED_COMP = {
          WSC: { label: '체중이동형', value: ['AIRFRAME', 'ENGINE', 'GLIDER'] },
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
          WSC: { label: '체중이동형', value: ['AIRFRAME', 'ENGINE', 'GLIDER', 'PROPELLER'] },
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
      */

      // 보관처 분류
      var REGION = {
        SK:  { label: '수도권', value: 'SK', acenter: 'SC' },
        KW:  { label: '강원', value: 'KW', acenter: 'SC' },
        CB:  { label: '충북', value: 'CB', acenter: 'SC' },
        CN:  { label: '충남', value: 'CN', acenter: 'SC' },
        JB:  { label: '전북', value: 'JB', acenter: 'SC' },
        JN:  { label: '전남', value: 'JN', acenter: 'BC' },
        KB:  { label: '경북', value: 'KB', acenter: 'BC' },
        KN:  { label: '경남', value: 'KN', acenter: 'BC' },
        JJ:  { label: '제주', value: 'JJ', acenter: 'JC' },
      };

      // 지방항공청 분류
      var ACENTER = {
        SC:  { label: '서항청', value: 'SC' },
        BC:  { label: '부항청', value: 'BC' },
        JC:  { label: '제항청', value: 'JC' }
      };

      // 파일 종류
      var FILE_TYPE = {
        GEN:  { label: '일반',    value: 'GEN' },
        APP:  { label: '신청서류',  value: 'APP' },
        INS:  { label: '검사서류',  value: 'INS' },
        MAN:  { label: '매뉴얼',   value: 'MAN' },
        SBU:  { label: '기술회보',  value: 'SBU' },
        IMG:  { label: '이미지',   value: 'IMG' },
        CER:  { label: '인증서',   value: 'CER' },
        ETC:  { label: '기타',    value: 'ETC' }
      };

      // 인증서 무효 사유
      var INVALID_TYPE = {
        WAIT:   { label: '미교부',   value: 'WAIT'  },
        FAIL:   { label: '불합격',   value: 'FAIL'  },
        DELAY:  { label: '검사연기', value: 'DELAY' },
        EXPIRE: { label: '만료',     value: 'EXPIRE'}, 
        ETC:    { label: '기타',     value: 'ETC'   }
      };

      // 비행안전정보 타입(AD, SB 등)
      var FLTSAFETY_TYPE = {
        AD:   { label: 'AD',  value: 'AD' },
        ASB:  { label: 'ASB', value: 'ASB'},
        SA:   { label: 'SA',  value: 'SA' },
        SB:   { label: 'SB',  value: 'SB' },
        SL:   { label: 'SL',  value: 'SL' },
        SN:   { label: 'SN',  value: 'SN' },
        SI:   { label: 'SI',  value: 'SI' }
      };      

      // 정비 유형
      var MAINT_TYPE = {
        SCH:  { label: 'SCH', value: 'SCH' },
        REP:  { label: 'REP', value: 'REP' },
        ALT:  { label: 'ALT', value: 'ALT' },
        FST:  { label: 'FST', value: 'FST' },
        OVH:  { label: 'OVH', value: 'OVH' },
        ETC:  { label: 'ETC', value: 'ETC' }
      };      

      var CERT_TYPE = {
        TMP:  { label: '임시', value: 'TMP' },
        RGL:  { label: '정식', value: 'RGL' }
      };  

      var CERT_RATE = {
        R1:  { label: '1종', value: 'R1' },
        R2:  { label: '2종', value: 'R2' },
        R3:  { label: '3종', value: 'R3' },
        R4:  { label: '4종', value: 'R4' }
      };  

      var RATE_LIMIT = {
        R1:  { label: '제한 사항 없음', value: 'R1' },
        R2:  { label: '항공기대여업 또는 항공레저스포츠사업에의 사용 제한', value: 'R2' },
        R3:  { label: '1. 항공기대여업 또는 항공레저스포츠사업에의 사용 제한\r\n2. 조종사를 포함하여 2명이 탑승한 경우에는 이륙 장소의 중심으로부터 반경 10킬로미터  또는 해당 초경량비행장치 비행구역(UA)을 초과하여 비행에 사용 제한', value: 'R3' },
        R4:  { label: '1. 조종사 이외의 동승자 탑승 금지\r\n2. 항공기대여업 또는 항공레저스포츠사업에의 사용 제한\r\n3. 이륙 장소의 중심으로부터 반경 10킬로미터  또는 해당 초경량비행장치 비행구역(UA)을 초과하여 비행에 사용 제한\r\n4. 인구 밀집지역의 상공 비행 제한', value: 'R4' },
      };    

      var INS_TYPE = {
        INI:  { label: '초도',   value: 'INI' },
        SCH:  { label: '정기',   value: 'SCH' },
        ONT:  { label: '수시',   value: 'ONT' },
        REI:  { label: '재검',   value: 'REI' },
        REP:  { label: '재발급', value: 'REP' },
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

      var getEnumString = function (enumArray, val) {
        var item = _.find(enumArray, { value: val });
        return item ? item.label : null;
      };

      var lsaCategories = getEnumArray(LSA_CATEGORY);
      var compTypes = getEnumArray(COMP_TYPE);
      var mfgTypes = getEnumArray(MFG_TYPE);
      var bldTypes = getEnumArray(BLD_TYPE);
      var gearTypes = getEnumArray(GEAR_TYPE);
      var ulvTypes = getEnumArray(ULV_TYPE);
      var lsaTypes = getEnumArray(LSA_TYPE);
      var regStatuses = getEnumArray(REG_STATUS);
      var regTypes = getEnumArray(REG_TYPE);
      var regions = getEnumArray(REGION);
      var aCenters = getEnumArray(ACENTER);
      var fileTypes = getEnumArray(FILE_TYPE);
      var invalidTypes = getEnumArray(INVALID_TYPE);
      var fltSafetyTypes = getEnumArray(FLTSAFETY_TYPE);
      var maintTypes = getEnumArray(MAINT_TYPE);
      var certTypes = getEnumArray(CERT_TYPE);
      var certRates = getEnumArray(CERT_RATE);
      var rateLimits = getEnumArray(RATE_LIMIT);
      var insTypes = getEnumArray(INS_TYPE);

      var getLsaCatString = function (val) { return getEnumString(lsaCategories, val); }
      var getCompTypeString = function (val) { return getEnumString(compTypes, val); }
      var getMfgTypeString = function (val) { return getEnumString(mfgTypes, val); }
      var getBldTypeString = function (val) { return getEnumString(bldTypes, val); }
      var getGearTypeString = function (val) { return getEnumString(gearTypes, val); }
      var getUlvTypeString = function (val) { return getEnumString(ulvTypes, val); }
      var getLsaTypeString = function (val) { return getEnumString(lsaTypes, val); }
      var getRegStatusString = function (val) { return getEnumString(regStatuses, val); }
      var getRegTypeString = function (val) { return getEnumString(regTypes, val); }
      var getRegionString = function (val) { return getEnumString(regions, val); }
      var getACenterString = function (val) { return getEnumString(aCenters, val); }
      var getFileTypeString = function (val) { return getEnumString(fileTypes, val); }
      var getInvalidTypeString = function (val) { return getEnumString(invalidTypes, val); }
      var getFltSafetyTypeString = function (val) { return getEnumString(fltSafetyTypes, val); } 
      var getMaintTypeString = function (val) { return getEnumString(maintTypes, val); } 
      var getCertTypeString = function (val) { return getEnumString(certTypes, val); } 
      var getCertRateString = function (val) { return getEnumString(certRates, val); } 
      var getRateLimitString = function (val) { return getEnumString(rateLimits, val); } 
      var getInsTypeString = function (val) { return getEnumString(insTypes, val); } 

      var getRequiredCompTypes = function (type) { return REQUIRED_COMP[type].values; }
      var getInstallableCompTypes = function (type) { return INSTALLABLE_COMP[type].values; }

      return {
          MFG_TYPE: MFG_TYPE,
          BLD_TYPE: BLD_TYPE,
          COMP_TYPE: COMP_TYPE,
          LSA_CATEGORY: LSA_CATEGORY,
          GEAR_TYPE: GEAR_TYPE,
          AIRCRAFT_TYPE: AIRCRAFT_TYPE,
          ULV_TYPE: ULV_TYPE,
          LSA_TYPE: LSA_TYPE,
          REG_STATUS: REG_STATUS,
          REG_TYPE: REG_TYPE,
          REQUIRED_COMP: REQUIRED_COMP,
          INSTALLABLE_COMP: INSTALLABLE_COMP,
          REGION: REGION,
          ACENTER: ACENTER,
          FILE_TYPE: FILE_TYPE,
          INVALID_TYPE: INVALID_TYPE,
          FLTSAFETY_TYPE: FLTSAFETY_TYPE,
          MAINT_TYPE: MAINT_TYPE,
          CERT_TYPE: CERT_TYPE,
          CERT_RATE: CERT_RATE,
          RATE_LIMIT: RATE_LIMIT,
          INS_TYPE: INS_TYPE,

          getEnumValues: getEnumValues,
          getEnumLabels: getEnumLabels,
          getEnumKeys: getEnumKeys,
          getEnumArray: getEnumArray,
          getEnumString: getEnumString,
          lsaCategories: lsaCategories,
          compTypes: compTypes,
          mfgTypes: mfgTypes,
          bldTypes: bldTypes,
          gearTypes: gearTypes,
          ulvTypes: ulvTypes,
          lsaTypes: lsaTypes,
          regStatuses: regStatuses,
          regTypes: regTypes,
          regions: regions,
          aCenters: aCenters,
          fileTypes: fileTypes,
          invalidTypes: invalidTypes,
          fltSafetyTypes: fltSafetyTypes,
          maintTypes: maintTypes,
          certTypes: certTypes,
          certRates: certRates,
          rateLimits: rateLimits,
          insTypes: insTypes,
          
          getLsaCatString:  getLsaCatString,
          getCompTypeString: getCompTypeString,
          getMfgTypeString: getMfgTypeString,
          getBldTypeString: getBldTypeString,
          getGearTypeString: getGearTypeString,
          getUlvTypeString: getUlvTypeString,
          getLsaTypeString: getLsaTypeString,
          getRegStatusString: getRegStatusString,
          getRegTypeString: getRegTypeString,
          getRegionString: getRegionString,
          getACenterString: getACenterString,
          getFileTypeString: getFileTypeString,
          getInvalidTypeString: getInvalidTypeString,
          getFltSafetyTypeString: getFltSafetyTypeString,
          getMaintTypeString: getMaintTypeString,
          getCertTypeString: getCertTypeString,
          getCertRateString: getCertRateString,
          getRateLimitString: getRateLimitString,
          getInsTypeString: getInsTypeString,

          getRequiredCompTypes: getRequiredCompTypes,
          getInstallableCompTypes: getInstallableCompTypes
      };
  });