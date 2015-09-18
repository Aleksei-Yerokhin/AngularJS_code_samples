angular
    .module('BuyNow.DDBasedDomainValidation')
    .directive('setAttribute', function ($compile) {
        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            link: function ($scope, element, attrs) {
                var prop = $scope.$eval(attrs.setAttribute);

                prop.validationRulesToApply.forEach(function (rule) {
                    if (rule.name === 'min' || rule.name === 'max'){
                        attrs.$set(rule.name, rule.val);
                    } else {
                        attrs.$set("ng-"+rule.name, rule.val);
                    }

                });
                element.removeAttr('set-attribute');
                $compile(element)($scope);
            }
        }
    });