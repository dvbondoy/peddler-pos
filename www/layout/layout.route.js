(function() {
  'use strict';

  angular.module('app.layout').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates(), '/app/sales');
  }

  function getStates() {
    return [
      {
        state: 'app',
        config: {
          url: '/app',
          abstract: true,
          templateUrl: 'layout/app.html'
        }
      },
      {
        state: 'app.login',
        config: {
          url: '/login',
          templateUrl: 'layout/login.html'
        }
      }
    ];
  }
})();