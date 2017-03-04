(function() {
    'use strict';

    angular.module('app.inapp').run(appRun);

    appRun.$inject = ['routerHelper'];
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'app.inapp',
                config: {
                    url: '/inapp',
                    templateUrl: 'inapp/templates/inapp.html'
                }
            }
        ];
    }
})();