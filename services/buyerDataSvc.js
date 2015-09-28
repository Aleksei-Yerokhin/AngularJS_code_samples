!function () {
    'use strict';

    angular.module('BuyNow.Buyer')
        .factory('BuyerDataSvc', function ($http, kendo, ApiServerHost, ConstantSvc) {
            var statuses = {
                confirm: 'confirm',
                newpayment: 'newpayment',
                cancelled: 'cancelled'
            };

            return {
                getBuyerOrderListStatus: getBuyerOrderListStatus,
                getBuyerOrderListStatusUrl: getBuyerOrderListStatusUrl,
                changeShipmentReturnedStatus: changeShipmentReturnedStatus,
                getBuyerOrder: getBuyerOrder,
                getMasterStatusOrder: getMasterStatusOrder,
                getMasterStatuses: function () {
                    return statuses;
                },
                getCreditAccount: getCreditAccount,
                submitCreditAccount: submitCreditAccount,
                getCreditTermsRequestPaymentInfo: getCreditTermsRequestPaymentInfo,
                confirmCreditRequest: confirmCreditRequest,
                confirmOrder: confirmOrder,
                cancelOrder: cancelOrder,
                getAddressList: getAddressList,
                saveAddress: saveAddress,
                setPrimaryAddress: setPrimaryAddress,
                deleteAddress: deleteAddress,
                sendPaypalPaymentRequest:sendPaypalPaymentRequest,
                confirmEscrowRequest:confirmEscrowRequest,
                getEscrowRequestInfo:getEscrowRequestInfo,
                buyerConfirmOrderWithEmailToSupplier:buyerConfirmOrderWithEmailToSupplier,
                setIsInternationalTransaction:setIsInternationalTransaction,
                getCreditAccountByOrderId: getCreditAccountByOrderId
            };

            function getBuyerOrderListStatusUrl(bnCartId, isHistorical) {
                return ApiServerHost + 'BuyerOrderListStatus/Cart/' + bnCartId + '?isHistorical=' + isHistorical;
            }
            function getBuyerOrderListStatus(bnCartId, isHistorical) {
                return $http.post(getBuyerOrderListStatusUrl(bnCartId, isHistorical), kendo.getInitFilter())
                    .then($http.getDataFromResult);
            }
            function changeShipmentReturnedStatus(orderId, data) {
                return $http.post(ApiServerHost + 'orders/'+ orderId +'/ChangeShipmentReturnedStatus', data)
            }

            function getBuyerOrder(bnOrderId) {
                var sendData = {
                    params: {
                        includes: "BuyerShipTo,BuyerBillTo,SupplierShipTo,SupplierBillTo,SupplierQuote,SupplierQuoteItems,BuyerRequest,SupplierResponse,EscrowPaymentInfo,Attachments"
                    }
                }

                return $http.get(ApiServerHost + 'ShoppingCart/' + 0 + '/Orders/' + bnOrderId, sendData)
                   .then($http.getDataFromResult);
            }

            function getCreditAccount(bnBuyerId, supplierId) {
                return $http.get(ApiServerHost + 'Buyers/' + bnBuyerId + '/CreditAccounts?supplierId=' + supplierId)
                    .then($http.getDataFromResult);
            }

            function getCreditAccountByOrderId(orderId) {
                return $http.get(ApiServerHost + 'BnCartOrder/' + orderId + '/CreditAccounts')
                    .then($http.getDataFromResult);
            }

            function submitCreditAccount(bnBuyerId, creditAccountObject) {
                return $http.post(ApiServerHost + 'Buyers/' + bnBuyerId + '/CreditAccounts', creditAccountObject)
                    .then($http.getDataFromResult);
            }

            function getCreditTermsRequestPaymentInfo(cartId, orderId) {
               return $http.get(ApiServerHost + 'ShoppingCart/' + cartId + '/Orders/'+orderId+'/PaymentInfo')
                    .then($http.getDataFromResult);
            }

            function confirmCreditRequest(bnCartId, bnCartOrderId) {
                return $http.post(ApiServerHost + 'ShoppingCart/' + bnCartId + '/Orders/' + bnCartOrderId + '/ConfirmCreditRequest')
                     .then($http.getDataFromResult);
            }

            function getMasterStatusOrder(bnOrderId, status) {
                var def;
                var sendData = {
                    params: {
                        includes: "BuyerShipTo,BuyerBillTo,SupplierShipTo,SupplierBillTo,SupplierQuote,SupplierQuoteItems,BuyerRequest,SupplierResponse,EscrowPaymentInfo,Attachments"
                    }
                }

                switch (status) {
                    case statuses.newpayment:
                        sendData = {
                            params: {
                                includes: "BuyerShipTo,BuyerBillTo,SupplierShipTo,SupplierBillTo,SupplierQuote, OrderItems,SupplierQuoteItems,BuyerRequest,SupplierResponse,EscrowPaymentInfo,Attachments",
                                orderStatuses: ConstantSvc.orderStatuses.buyerEnterNewPaymentMethod
                            }
                        };
                        def = $http.get(ApiServerHost + 'ShoppingCart/' + 0 + '/Orders/' + bnOrderId, sendData);
                        break;
                    case statuses.cancelled:
                        sendData = {
                            params: {
                                includes: "BuyerShipTo,BuyerBillTo,SupplierShipTo,SupplierBillTo,OrderItems",
                                orderStatuses: ConstantSvc.orderStatuses.buyerCancelled + ',' + ConstantSvc.orderStatuses.supplierCancelled + ',' + ConstantSvc.orderStatuses.orderCanceledByEscrowCom
                            }
                        };
                        def = $http.get(ApiServerHost + 'ShoppingCart/' + 0 + '/Orders/' + bnOrderId, sendData);
                        break;
                    case statuses.confirm:
                    default:
                        sendData = {
                            params: {
                                includes: "BuyerShipTo,BuyerBillTo,SupplierShipTo,SupplierBillTo,SupplierQuote, OrderItems,SupplierQuoteItems,BuyerRequest,SupplierResponse,EscrowPaymentInfo,Attachments,SupplierCommissions",
                                orderStatuses: ConstantSvc.orderStatuses.buyerConfirmingOrder
                            }
                        };

                        def = $http.get(ApiServerHost + 'ShoppingCart/' + 0 + '/Orders/' + bnOrderId,sendData);
                }

                return def.then($http.getDataFromResult);
            }

            function cancelOrder(bnCartId, bnCartOrderId) {
                return $http.post(ApiServerHost + 'ShoppingCart/' + bnCartId + '/Orders/' + bnCartOrderId + '/OrderCancelledByBuyer');
            }

            function confirmOrder(orderId) {
                return $http.post(ApiServerHost + 'orders/'+ orderId +'/confirmOrderByBuyer');
            }

            function setIsInternationalTransaction(orderId) {
                return $http.post(ApiServerHost + 'orders/'+ orderId +'/isInternationalTransaction');
            }

            /// address
            function getAddressList(bnBuyerId) {
                return $http.get(ApiServerHost + 'Buyers/'+ bnBuyerId +'/addresses')
                    .then($http.getDataFromResult);
               }
            function saveAddress(bnBuyerId, data) {
                return $http.post(ApiServerHost + 'Buyers/'+ bnBuyerId +'/addresses', data)
                    .then($http.getDataFromResult);
            }
            function setPrimaryAddress(bnBuyerId, bnCartOrderId, data) {
                return $http.put(ApiServerHost + 'Buyers/'+ bnBuyerId +'/BnCartOrder/'+ bnCartOrderId +'/selectaddress', data);
            }

            function deleteAddress(bnBuyerId, addressId) {
                return $http.delete(ApiServerHost + 'Buyers/'+ bnBuyerId +'/addresses/' + addressId);
            }

            function sendPaypalPaymentRequest(model) {
                return $http.post(ApiServerHost + 'Payments?paymentMethod=PayPal',model);
            }


            function getEscrowRequestInfo(bnCartId, bnCartOrderId) {
                return $http.get(ApiServerHost + 'ShoppingCart/' + bnCartId + '/Orders/' + bnCartOrderId +  '/Escrow' )
                    .then($http.getDataFromResult);
            }

            function confirmEscrowRequest(bnCartId,bnCartOrderId,escrowInfo) {
                return $http.post(ApiServerHost + 'ShoppingCart/' + bnCartId + '/Orders/' + bnCartOrderId + '/Escrow', escrowInfo)
                    .then($http.getDataFromResult);
            }

            function buyerConfirmOrderWithEmailToSupplier(orderId) {
                return $http.post(ApiServerHost + 'Orders/'+orderId+'/BuyerConfirmOrderWithEmailToSupplier')
                    .then($http.getDataFromResult);
            }

        });
}();