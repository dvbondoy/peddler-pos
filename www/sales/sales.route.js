(function() {
  'use strict';

  angular.module('app.sales').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'app.sales',
        config: {
          url: '/sales',
          templateUrl: 'sales/templates/home.html'
        }
      }
    ]
  }
})();