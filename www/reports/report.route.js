(function() {
  'use strict';

  angular.module('app.report').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'app.report',
        config: {
          url: '/report',
          templateUrl: 'reports/templates/report.html'
        }
      }
    ];
  }
})();