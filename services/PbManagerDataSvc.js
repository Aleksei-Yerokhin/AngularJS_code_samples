!function () {
    'use strict';

    angular.module('BuyNow.Buyer')
        .factory('PbManagerDataSvc', function ($http, ApiServerHost, AuthorizationServerHost, kendo) {
            return {
                getManagerDashboardData: getManagerDashboardData,
                getManagerOrderListStatusUrl: getManagerOrderListStatusUrl,
                getOrder: getOrder,
                getManagerAccountsData: getManagerAccountsData,
                getManagerAccountsUrl: getManagerAccountsUrl,
                changeAccountActivity: changeAccountActivity,
                getOrganizations: getOrganizations,
                signUpNewAdminAccount: signUpNewAdminAccount,
                saveExistingAdminAccount: saveExistingAdminAccount
            };

            function getOrganizations() {
                return $http.get(ApiServerHost + 'enums/organizations')
                    .then($http.getDataFromResult);
            }

            function saveExistingAdminAccount(accountData){
                return $http.put(ApiServerHost + 'Accounts', accountData)
                    .then(function(res){
                        return res;
                    }, function(err){
                        return err;
                    })
            }

            function signUpNewAdminAccount(signUpData) {
                var dataForRegistration = {};
                dataForRegistration.userName = signUpData.employeeOrganizationEmail;
                dataForRegistration.password = signUpData.password;
                dataForRegistration.confirmPassword = signUpData.confirmPassword;

                return $http.post(AuthorizationServerHost + 'Accounts/SignUp', dataForRegistration)
                    .then(function(res){
                        signUpData.AspNetUserId = res.data.Id;
                        return saveAdminAccount(signUpData);
                    },
                        function (error){
                            if (error.status){
                                if (error.status === 400){
                                    return {
                                        errorMessage: error.data.ModelState["User Registration"][0]
                                    };
                                }
                            }
                        })
            }

            function saveAdminAccount(dataToSubmit){
                return $http.post(ApiServerHost + 'Accounts', dataToSubmit)
                    .then(function(res){
                        return res;
                    }, function(error){
                        return error;
                    })
            }

            function getOrder(bnCartId,bnOrderId) {
                return $http.get(ApiServerHost + 'ShoppingCart/' +bnCartId+'/Orders/'+ bnOrderId+'?includes=BuyerShipTo,BuyerBillTo,SupplierShipTo,SupplierBillTo,SupplierQuote,SupplierQuoteItems,BuyerRequest,SupplierResponse,EscrowPaymentInfo,Attachments,SupplierCommissions')
                    .then($http.getDataFromResult);
            }

            function getManagerDashboardData(isHistorical){
                return $http.post(getManagerOrderListStatusUrl(isHistorical), kendo.getInitFilter())
                    .then($http.getDataFromResult);
            }

            function getManagerOrderListStatusUrl(isHistorical){
                return ApiServerHost + 'ordersForPbEmployee?isHistorical=' + (isHistorical || false);
            }

            function getManagerAccountsUrl(){
                return ApiServerHost + 'Accounts/Admins';
            }

            function getManagerAccountsData() {
                return $http.post(getManagerAccountsUrl(), kendo.getInitFilter())
                    .then($http.getDataFromResult);
            }

            function changeAccountActivity(accountId, isActive) {
                return $http.post(ApiServerHost + 'Accounts/'+ accountId +'/activeness?isActive=' + isActive)
            }
        });
}();