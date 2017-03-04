(function() {
'use strict';

    angular
        .module('app.inapp')
        .controller('InappController', InappController);

    InappController.$inject = ['$scope'];
    function InappController($scope) {
        var vm = this;

        $scope.Purchase = {
            premium:function(){

            },
            subscription:function(){

            }
        };
        

    }
})();