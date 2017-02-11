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
          templateUrl: 'report/templates/report.html'
        }
      },
      {
        state: 'app.sales_report',
        config: {
          url: '/sales_report',
          templateUrl: 'report/templates/sales_report.html'
        }
      }
    ];
  }
})();