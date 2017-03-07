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
      },
      {
        state: 'app.sales_details',
        config: {
          url: '/sales_details',
          templateUrl: 'reports/templates/sales-details.html',
          params:{
            list:null
          }
        }
      }
    ];
  }
})();