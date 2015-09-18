angular
    .module('BuyNow.DDBasedDomainValidation')
    .factory('DDBasedDomainValidationSvc', function ($http, $q, ApiServerHost) {
        var validationRules = {
                isRequired: false,
                isRange: false,
                defaultValue: "",
                maxLength: 0,
                minLength: 0,
                minValue: 0,
                maxValue: 0,
                minDate: "0001-01-01T00:00:00",
                maxDate: "0001-01-01T00:00:00",
                minTime: "00:00:00",
                maxTime: "00:00:00",
                minDateTime: "0001-01-01T00:00:00",
                maxDateTime: "0001-01-01T00:00:00",
                validateExpression: ""
            },
            validationRulesToAttributesMapper = {
                isRequired: [{ attrName: 'required', attrVal: 'true' }],
                isRange: [{ attrName: 'type', attrVal: 'range' }],
                maxLength: [{ attrName: 'maxlength' }],
                minLength: [{ attrName: 'minlength' }],
                maxValue: [{ attrName: 'max' }],
                minValue: [{ attrName: 'min' }],
                minDate: [{ attrName: 'type',attrVal: 'date' }, { attrName: 'min' }],
                maxDate: [{ attrName: 'type',attrVal: 'date' }, { attrName: 'max' }],
                minTime: [{ attrName: 'type', attrVal: 'time' }, { attrName: 'min' }],
                maxTime: [ { attrName: 'type', attrVal: 'time' }, { attrName: 'max' }],
                minDateTime: [{ attrName: 'type', attrVal: 'datetime' }, { attrName: 'min' }],
                maxDateTime: [{ attrName: 'type', attrVal: 'datetime' }, { attrName: 'max' }],
                validateExpression: [{ attrName: 'validate-by-pattern' }]
            };

        return {
            getDDEntity: getDDEntity,
            setValidationRulesToApply: setValidationRulesToApply
        };

        function getDDEntity(entityName) {
            return $http.get(ApiServerHost + 'ddviewmodel/' + entityName).then($http.getDataFromResult);
        }

        function setValidationRulesToApply(ddEntityProps) {
            var currentPropValidationRulesToApply = [];
            for (var propName in ddEntityProps){
                if (ddEntityProps.hasOwnProperty(propName)){
                    for(var propValidationName in ddEntityProps[propName].propertyValidation) {
                        if(validationRules.hasOwnProperty(propValidationName) &&
                            ddEntityProps[propName].propertyValidation[propValidationName] !== '0001-01-01T00:00:00' &&
                            ddEntityProps[propName].propertyValidation[propValidationName] !== '00:00:00' &&
                            ddEntityProps[propName].propertyValidation[propValidationName] !== '' &&
                            ddEntityProps[propName].propertyValidation[propValidationName] !== false &&

                            !(propValidationName === 'maxLength' && ddEntityProps[propName].propertyValidation.maxLength === 0) &&
                            !(propValidationName === 'maxValue' && ddEntityProps[propName].propertyValidation.maxValue === 0)
                        ) {

                            if(propValidationName === 'defaultValue') {
                                ddEntityProps[propName].value = ddEntityProps[propName].propertyValidation.defaultValue;
                            }
                            else {
                                validationRulesToAttributesMapper[propValidationName].forEach(function (attr) {
                                    currentPropValidationRulesToApply.push({
                                        name: attr.attrName,
                                        val: attr.attrVal || ddEntityProps[propName].propertyValidation[propValidationName]
                                    });
                                });
                            }
                        }
                    }
                    ddEntityProps[propName].validationRulesToApply = angular.copy(currentPropValidationRulesToApply);

                    currentPropValidationRulesToApply = [];
                }
            }
        }
    });