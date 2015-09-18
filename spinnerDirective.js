angular
    .module('BuyNow.Common')
    .directive('spinner', function ($compile) {
        return {
            restrict: 'A',
            scope: false,
            link: function ($scope, element, attrs) {
                var spinnerManager = attrs.spinner,
                    spinnerSpinClass = attrs.spinnerSpinClass ? attrs.spinnerSpinClass : "fa-spin",
                    spinnerClass = attrs.spinnerClass ? attrs.spinnerClass : "fa fa-spinner";
                attrs.$set('class', spinnerClass);
                attrs.$set('ng-show', spinnerManager);
                attrs.$set('ng-class', "{'" + spinnerSpinClass + "' :" + spinnerManager + '}');

                element.removeAttr('spinner');
                $compile(element)($scope);
            }
        }
    });
