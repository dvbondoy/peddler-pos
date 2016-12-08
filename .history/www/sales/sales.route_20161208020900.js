(function() {
  'use strict';

  angular.module('app.sales', ['routerHelper']).run(appRun);

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