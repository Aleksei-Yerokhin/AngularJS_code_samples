!function(){
    'use strict';

    angular
        .module('BuyNow.BuyerAdministrator')
        .controller('FinancialInfoCtrl', FinancialInfoCtrl);

    function FinancialInfoCtrl($scope, $location, $timeout, $routeParams, $modal, $anchorScroll, _, BuyerAdministratorSvc, ConstantSvc, initData){
        var vm = this;
        vm.isOnlyReadPage = initData.isOnlyReadPage;
        vm.showP1 = true;
        vm.showP2 = false;
        vm.links = {
            dashboard: '/BuyerAdmin/{bnBuyerId}/Dashboard'
        };
        vm.data = initData;
        vm.isDraft = false;
        vm.inProgress = false;
        vm.financialInfo = angular.copy(initData.financialInfo);
        vm.setBusinessAreasTouched = setBusinessAreasTouched;
        vm.setAddressAsAddress = setAddressAsAddress;
        vm.onCountryChange = onCountryChange;
        vm.getLastTaxId = getLastTaxId;
        vm.setLegalBusinessClassification = setLegalBusinessClassification;
        vm.hasLastBusinessAreaId = hasLastBusinessAreaId;
        vm.isBusinessAreasEmpty = isBusinessAreasEmpty;
        vm.isFieldRequired = isFieldRequired;
        vm.saveApplication = saveApplication;
        vm.showNextPageApplication = showNextPageApplication;


        if(vm.financialInfo.bankReferences.length < 2) {
            while(vm.financialInfo.bankReferences.length !== 2) {
                vm.financialInfo.bankReferences.push({});
            }
        }
        if(vm.financialInfo.industryTradeReferences.length < 5) {
            while(vm.financialInfo.industryTradeReferences.length !== 5) {
                vm.financialInfo.industryTradeReferences.push({});
            }
        }
        if(vm.financialInfo.officerInformation.others.length < 5) {
            while(vm.financialInfo.officerInformation.others.length !== 5) {
                vm.financialInfo.officerInformation.others.push({});
            }
        }

        function saveApplication(formP1, formP2, isDraft, back) {
            vm.inProgress = true;
            vm.isDraft = isDraft;
            if (back){
                vm.showP1 = true;
                vm.showP2 = false;
                document.body.scrollTop = 0;
                vm.inProgress = false;
                vm.isDraft = undefined;
                return;
            }
            if (vm.showP1){
                if (isDraft){
                    BuyerAdministratorSvc.saveApplication($routeParams.buyerBnCustomerId, _getSubmitObj(), isDraft).then(function () {
                        $location.path('/MainDashboard/buyerSellerAdminDashboard/' + $routeParams.buyerBnCustomerId);
                    }).catch(function(){
                        disableInProgress();
                    });
                } else {
                    formP1.$submitted = true;
                    isDraft = true;
                    if (formP1.$valid){
                        if(!back){
                            BuyerAdministratorSvc.saveApplication($routeParams.buyerBnCustomerId, _getSubmitObj(), true).then(function(){
                                vm.showP1 = false;
                                vm.showP2 = true;
                                disableInProgress();
                                vm.isDraft = undefined;
                                document.body.scrollTop = 0;
                                return;
                            }).catch(function(){
                                disableInProgress();
                            })
                        }

                    } else {
                        $modal({
                            scope: $scope,
                            template: '/App/Pages/BuyerAdministrator/Templates/Financial/appNotCompletedPopup.html',
                            show: true
                        }).$promise.then(function (){
                                disableInProgress();
                                vm.isDraft = undefined;
                            });
                    }
                }
            }

            if (vm.showP2){
                if (isDraft){
                    BuyerAdministratorSvc.saveApplication($routeParams.buyerBnCustomerId, _getSubmitObj(), isDraft).then(function () {
                        $location.path('/MainDashboard/buyerSellerAdminDashboard/' + $routeParams.buyerBnCustomerId);
                    }).catch(function(){
                        disableInProgress();
                    });
                } else {
                    formP2.$submitted = true;
                    formP2.tradeRefForm.$submitted = true;
                    if (formP2.$valid){
                        BuyerAdministratorSvc.saveApplication($routeParams.buyerBnCustomerId, _getSubmitObj(), isDraft).then(function () {
                            $location.path('/MainDashboard/buyerSellerAdminDashboard/' + $routeParams.buyerBnCustomerId);
                        }).catch(function(){
                            disableInProgress();
                        });
                    } else {
                        $modal({
                            scope: $scope,
                            template: '/App/Pages/BuyerAdministrator/Templates/Financial/appNotCompletedPopup.html',
                            show: true
                        }).$promise.then(function(){
                                disableInProgress();
                                vm.isDraft = undefined;
                            });
                    }
                }
            }
        }

        function showNextPageApplication(formP1, formP2, isDraft, back) {
            vm.inProgress = true;
            vm.isDraft = isDraft;
            if (back){
                vm.showP1 = true;
                vm.showP2 = false;
                document.body.scrollTop = 0;
                vm.inProgress = false;
                vm.isDraft = undefined;
                return;
            }
            if (vm.showP1){
                if (isDraft){
                        $location.path('/PbAdmin/ShoppingCart/0/Order/'+initData.orderId);
                } else {
                    isDraft = true;
                    vm.showP1 = false;
                    vm.showP2 = true;
                    vm.isDraft = undefined;
                    document.body.scrollTop = 0;
                    return;
                }
            }

            if (vm.showP2){
                $location.path('/PbAdmin/ShoppingCart/0/Order/'+initData.orderId);
            }
        }

        function _getSubmitObj() {
            var industryTradeRefId = vm.financialInfo.industryTradeReferences.length - 1,
                officeInfoOthersId = vm.financialInfo.officerInformation.others.length - 1,
                requiredFields = {
                    industryTradeRefs: ['institutionName', 'accountNumber', 'institutionPhone'],
                    officeInfoOthers: ['fullName', 'phone', 'cellPhone', 'fax', 'email']
                },
                idsToDelete = {
                    industryTradeRefs: [],
                    officeInfoOthers: []
                },
                creditAppSubmitObj = angular.copy(vm.financialInfo);
            for(; industryTradeRefId >= 0; industryTradeRefId--) {
                requiredFields.industryTradeRefs.forEach(function (indTradeRefField) {
                    if(!creditAppSubmitObj.industryTradeReferences[industryTradeRefId][indTradeRefField] && idsToDelete.industryTradeRefs.indexOf(industryTradeRefId) === -1) {
                        idsToDelete.industryTradeRefs.push(industryTradeRefId);
                    }
                });
            }
            for(; officeInfoOthersId >= 0; officeInfoOthersId--) {
                requiredFields.officeInfoOthers.forEach(function (officeInfoOthersField) {
                    if(!creditAppSubmitObj.officerInformation.others[officeInfoOthersId][officeInfoOthersField] && idsToDelete.officeInfoOthers.indexOf(officeInfoOthersId) === -1) {
                        idsToDelete.officeInfoOthers.push(officeInfoOthersId);
                    }
                });
            }

            creditAppSubmitObj.industryTradeReferences = _.toArray(_.omit(creditAppSubmitObj.industryTradeReferences, idsToDelete.industryTradeRefs));
            creditAppSubmitObj.officerInformation.others = _.toArray(_.omit(creditAppSubmitObj.officerInformation.others, idsToDelete.officeInfoOthers));

            if (!hasLastBusinessAreaId()) {
                creditAppSubmitObj.otherBusinessArea = null;
            }
            creditAppSubmitObj.businessAreas = getCompactBusinessAreas();

            if (creditAppSubmitObj.legalBusinessClassification != getLastTaxId()) {
                creditAppSubmitObj.taxClasificationOther = null;
            }

            delete creditAppSubmitObj.businessAreaIdNames;
            delete creditAppSubmitObj.federalTaxClassificationIdNames;

            return creditAppSubmitObj;
        }

        function isFieldRequired(item, fieldName) {
            var isRequired = false;
            for(var currentFieldName in item) {
                if(currentFieldName !== '$$hashKey' && currentFieldName !== fieldName && !!item[currentFieldName]) {
                    isRequired = true;
                }
            }
            return isRequired;
        }

        function setAddressAsAddress(toAddress, fromAddress) {
            if (vm.isSame) {
                vm.financialInfo[toAddress] = vm.financialInfo[fromAddress];
            } else {
                vm.financialInfo[toAddress] = angular.copy(vm.financialInfo[fromAddress]);
            }
        }

        function onCountryChange(addressKey) {
            vm.financialInfo[addressKey].countryId = ConstantSvc.usCode;
        }

        function setLegalBusinessClassification(taxClassificationId){
            if (taxClassificationId != getLastTaxId()){
                vm.financialInfo.taxClasificationOther = undefined;
            }
        }

        function getLastTaxId() {
            return _.last(vm.financialInfo.federalTaxClassificationIdNames).id
        }

        function hasLastBusinessAreaId() {
            var lastId = _.last(vm.financialInfo.businessAreaIdNames).id;

            // clear otherBusinessArea if appropriate checkbox isn't checked

            if (!(vm.financialInfo.businessAreas && vm.financialInfo.businessAreas[lastId])) {
                vm.financialInfo.otherBusinessArea = undefined;
            }
            return vm.financialInfo.businessAreas && vm.financialInfo.businessAreas[lastId];
        }

        function isBusinessAreasEmpty() {
            return !getCompactBusinessAreas().length;
        }

        init();

        function init() {
            if (!_.isEmpty(vm.financialInfo.businessAreas)) {
                var areas = vm.financialInfo.businessAreas;

                vm.financialInfo.businessAreas = {};
                _.each(areas, function (item) {
                    vm.financialInfo.businessAreas[item] = item;
                });
            }

            if (_.isEmpty(vm.financialInfo.shippingAddress)) {
                vm.financialInfo.billingAddress = {};
                vm.financialInfo.shippingAddress = {};
                onCountryChange('billingAddress');
                onCountryChange('shippingAddress');
            }

            if (_.isEmpty(vm.financialInfo.aircraftInformations)) {
                vm.financialInfo.aircraftInformations = [{}, {}];
            }

            if (!vm.financialInfo.legalBusinessClassification){
                vm.financialInfo.legalBusinessClassification = undefined;
            }

            if (!vm.financialInfo.stateOfIncorporationId){
                vm.financialInfo.stateOfIncorporationId = undefined;
            }
        }

        function getCompactBusinessAreas() {
            return _.compact(vm.financialInfo.businessAreas);
        }

        function setBusinessAreasTouched(){
            if ($scope.financialInfoFormP1.businessAreas.$touched === false){
                $scope.financialInfoFormP1.businessAreas.$touched = true;
            }
        }

        function disableInProgress() {
            vm.inProgress = false;
        }
    }
}();